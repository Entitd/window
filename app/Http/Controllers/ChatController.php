<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('chats/index', [
            'chats' => $this->chatListFor($user),
        ]);
    }

    public function show(Request $request, ServiceRequest $serviceRequest): Response
    {
        $this->authorizeServiceRequestChat($request, $serviceRequest);

        abort_if($serviceRequest->vendor_id === null, 404);

        $chat = Chat::firstOrCreate(
            ['request_id' => $serviceRequest->id],
            [
                'client_id' => $serviceRequest->client_id,
                'vendor_id' => $serviceRequest->vendor_id,
            ],
        );

        $chat->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $chat->load([
            'client:id,name,email',
            'vendor:id,user_id,company_name',
            'vendor.user:id,name,email',
            'serviceRequest:id,service_id,city,district,installation_date,estimated_price,status',
            'serviceRequest.service:id,name',
            'messages.sender:id,name,email',
        ]);

        return Inertia::render('chats/show', [
            'chat' => $this->serializeChat($chat, $request->user()),
            'chats' => $this->chatListFor($request->user()),
        ]);
    }

    public function store(Request $request, Chat $chat): RedirectResponse
    {
        $this->authorizeChat($request, $chat);

        $this->createMessage($request, $chat);

        return back();
    }

    public function storeForRequest(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        $this->authorizeServiceRequestChat($request, $serviceRequest);

        abort_if($serviceRequest->vendor_id === null, 404);

        $chat = Chat::firstOrCreate(
            ['request_id' => $serviceRequest->id],
            [
                'client_id' => $serviceRequest->client_id,
                'vendor_id' => $serviceRequest->vendor_id,
            ],
        );

        $this->createMessage($request, $chat);

        return back();
    }

    private function createMessage(Request $request, Chat $chat): void
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'content_type' => [
                'nullable',
                'string',
                Rule::in([ChatMessage::CONTENT_TYPE_TEXT]),
            ],
        ]);

        $chat->messages()->create([
            'sender_id' => $request->user()->id,
            'content' => $validated['content'],
            'content_type' => $validated['content_type'] ?? ChatMessage::CONTENT_TYPE_TEXT,
        ]);

        $chat->touch();
    }

    private function authorizeServiceRequestChat(Request $request, ServiceRequest $serviceRequest): void
    {
        $user = $request->user();

        if ($user->role === 'client') {
            abort_unless($serviceRequest->client_id === $user->id, 403);

            return;
        }

        if ($user->role === 'vendor') {
            $vendorId = $user->vendor()->value('id');

            abort_unless($vendorId && $serviceRequest->vendor_id === $vendorId, 403);

            return;
        }

        abort(403);
    }

    private function authorizeChat(Request $request, Chat $chat): void
    {
        $user = $request->user();

        if ($user->role === 'client') {
            abort_unless($chat->client_id === $user->id, 403);

            return;
        }

        if ($user->role === 'vendor') {
            $vendorId = $user->vendor()->value('id');

            abort_unless($vendorId && $chat->vendor_id === $vendorId, 403);

            return;
        }

        abort(403);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function chatListFor(User $user): Collection
    {
        $vendorId = $user->role === 'vendor'
            ? $user->vendor()->value('id')
            : null;
        $message = new ChatMessage;

        return Chat::query()
            ->select(['id', 'request_id', 'client_id', 'vendor_id', 'updated_at'])
            ->with([
                'client:id,name,email',
                'vendor:id,user_id,company_name',
                'vendor.user:id,name,email',
                'serviceRequest:id,service_id,city,district,installation_date,estimated_price,status',
                'serviceRequest.service:id,name',
                'latestMessage' => fn ($query) => $query->select([
                    $message->qualifyColumn('id'),
                    $message->qualifyColumn('chat_id'),
                    $message->qualifyColumn('content'),
                    $message->qualifyColumn('created_at'),
                ]),
            ])
            ->withCount([
                'messages as unread_messages_count' => fn ($query) => $query
                    ->where('sender_id', '!=', $user->id)
                    ->where('is_read', false),
            ])
            ->when(
                $user->role === 'client',
                fn ($query) => $query->where('client_id', $user->id),
            )
            ->when(
                $user->role === 'vendor',
                fn ($query) => $query->where('vendor_id', $vendorId),
            )
            ->latest('updated_at')
            ->get()
            ->map(fn (Chat $chat) => $this->serializeChatListItem($chat, $user))
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeChatListItem(Chat $chat, User $viewer): array
    {
        $latestMessage = $chat->latestMessage;

        return [
            'id' => (string) $chat->id,
            'requestId' => (string) $chat->request_id,
            'participantName' => $this->participantName($chat, $viewer),
            'participantSubtitle' => $this->participantSubtitle($chat, $viewer),
            'service' => $chat->serviceRequest?->service?->name ?? 'Заявка',
            'status' => $chat->serviceRequest?->status ?? 'new',
            'location' => $this->formatLocation($chat),
            'lastMessage' => $latestMessage?->content ?? 'Сообщений пока нет',
            'lastMessageAt' => $latestMessage?->created_at?->format('d.m.Y H:i') ?? '',
            'unreadCount' => $chat->unread_messages_count,
            'updatedAt' => $chat->updated_at?->format('d.m.Y H:i') ?? '',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeChat(Chat $chat, User $viewer): array
    {
        return [
            ...$this->serializeChatListItem($chat, $viewer),
            'request' => [
                'id' => (string) $chat->request_id,
                'service' => $chat->serviceRequest?->service?->name ?? 'Заявка',
                'status' => $chat->serviceRequest?->status ?? 'new',
                'city' => $chat->serviceRequest?->city ?? '',
                'district' => $chat->serviceRequest?->district ?? 'Не указан',
                'installationDate' => $chat->serviceRequest?->installation_date?->format('d.m.Y') ?? 'Не выбрана',
                'estimatedPrice' => $chat->serviceRequest?->estimated_price
                    ? number_format((float) $chat->serviceRequest->estimated_price, 0, ',', ' ').' ₽'
                    : 'После уточнения',
            ],
            'messages' => $chat->messages
                ->map(fn (ChatMessage $message) => [
                    'id' => (string) $message->id,
                    'senderId' => (string) $message->sender_id,
                    'senderName' => $message->sender?->name ?? 'Пользователь',
                    'content' => $message->content,
                    'contentType' => $message->content_type,
                    'isRead' => $message->is_read,
                    'isMine' => $message->sender_id === $viewer->id,
                    'sentAt' => $message->created_at?->format('d.m.Y H:i') ?? '',
                ])
                ->values(),
        ];
    }

    private function participantName(Chat $chat, User $viewer): string
    {
        if ($viewer->role === 'client') {
            return $chat->vendor?->company_name ?? 'Компания';
        }

        return $chat->client?->name ?? 'Клиент';
    }

    private function participantSubtitle(Chat $chat, User $viewer): string
    {
        if ($viewer->role === 'client') {
            return $chat->vendor?->user?->email ?? 'Представитель компании';
        }

        return $chat->client?->email ?? 'Клиент по заявке';
    }

    private function formatLocation(Chat $chat): string
    {
        $city = $chat->serviceRequest?->city;
        $district = $chat->serviceRequest?->district;

        return collect([$city, $district ? $district.' район' : null])
            ->filter()
            ->join(', ');
    }
}
