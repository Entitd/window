export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-900/15">
                О
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm leading-tight font-bold text-slate-950 dark:text-white">
                    Окна<span className="text-blue-500">Маркет</span>
                </span>
                <span className="truncate text-[10px] leading-tight font-semibold text-slate-500 dark:text-slate-400">
                    подбор оконных компаний
                </span>
            </div>
        </>
    );
}
