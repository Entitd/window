<?php

use Inertia\Testing\AssertableInertia as Assert;

test('pages index is available as a public inertia page', function () {
    $this->get(route('pages.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('pages-index'));
});
