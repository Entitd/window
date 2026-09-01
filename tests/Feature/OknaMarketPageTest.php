<?php

use Inertia\Testing\AssertableInertia as Assert;

test('okna market page is the home page', function () {
    $this->get(route('home'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('okna-market'));
});

test('calculate page is public', function () {
    $this->get(route('calculate'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calculate'));
});
