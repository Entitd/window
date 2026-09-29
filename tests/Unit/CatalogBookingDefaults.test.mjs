import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeDataIntoQueryString } from '@inertiajs/core';
import { queryParams } from '../../resources/js/wayfinder/index.ts';
import { catalogBookingDefaults, queryItems } from '../../resources/js/lib/catalog-booking.ts';

test('booking form restores dimensions and the rest of the search request', () => {
    const query = new URLSearchParams({
        width_mm: '1205',
        height_mm: '1500',
        quantity: '2',
        city: 'Москва',
        district: 'Центральный',
        installation_date: '2030-01-01',
        comment: 'Позвонить заранее',
    });
    assert.deepEqual(
        catalogBookingDefaults(`/services?${query}`, 'Другой город', true),
        {
            address: '',
            contact_name: '',
            contact_phone: '',
            arrival_from: '',
            arrival_until: '',
            width_mm: '1205',
            height_mm: '1500',
            quantity: '2',
            city: 'Москва',
            district: 'Центральный',
            installation_date: '2030-01-01',
            comment: 'Позвонить заранее',
        },
    );
});

test('selection tariffs do not submit prohibited dimensions', () => {
    const defaults = catalogBookingDefaults(
        '/services?width_mm=1200&height_mm=1500',
        'Москва',
        false,
    );
    assert.equal(defaults.width_mm, '');
    assert.equal(defaults.height_mm, '');
});

test('direct visits and invalid dimensions do not invent an estimate', () => {
    for (const url of [
        '/services',
        '/services?width_mm=NaN&height_mm=-1&quantity=0',
        '/services?width_mm=100001&height_mm=1.2',
    ]) {
        const defaults = catalogBookingDefaults(url, 'Москва', true);
        assert.equal(defaults.width_mm, '');
        assert.equal(defaults.height_mm, '');
        assert.equal(defaults.quantity, '1');
        assert.equal(defaults.city, 'Москва');
    }
});

test('saved user edits override search values and respect the current tariff input', () => {
    const draft = {
        rate_id: 1,
        width_mm: 1600,
        height_mm: 1700,
        quantity: 3,
        city: 'Москва',
        parameters: {},
    };
    const restored = catalogBookingDefaults(
        '/services?width_mm=1200&height_mm=1500',
        'Москва',
        true,
        draft,
    );
    assert.equal(restored.width_mm, '1600');
    assert.equal(restored.height_mm, '1700');
    assert.equal(restored.quantity, '3');
    const selection = catalogBookingDefaults(
        '/services',
        'Москва',
        false,
        draft,
    );
    assert.equal(selection.width_mm, '');
    assert.equal(selection.height_mm, '');
});


test('saved visit details survive the return to booking', () => {
    const draft = {
        rate_id: 1,
        parameters: {},
        address: 'Лесная, 10',
        contact_name: 'Анна',
        contact_phone: '+79991234567',
        arrival_from: '10:00',
        arrival_until: '12:00',
        installation_date: '2030-01-01',
    };
    const restored = catalogBookingDefaults('/services', 'Москва', false, draft);
    for (const field of ['address', 'contact_name', 'contact_phone', 'arrival_from', 'arrival_until', 'installation_date']) {
        assert.equal(restored[field], draft[field]);
    }
});


test('all chosen jobs survive generated links to booking and back to search', () => {
    const items = [
        { rate_id: 11, quantity: 2, width_mm: 1200, height_mm: 1500 },
        { rate_id: 22, quantity: 3, width_mm: null, height_mm: null },
    ];
    const url = '/services' + queryParams({ query: { items: Object.fromEntries(items.map((item, index) => [index, item])) } });
    assert.deepEqual(queryItems(url), [
        { rate_id: '11', quantity: '2', width_mm: '1200', height_mm: '1500' },
        { rate_id: '22', quantity: '3' },
    ]);
    assert.deepEqual(queryItems('/services?items[99][rate_id]=1'), []);
});


test('Inertia search preserves multiple jobs as indexed items', () => {
    const [url] = mergeDataIntoQueryString('get', 'https://local.invalid/search-results', {
        items: [{ service_id: '1', quantity: '2' }, { service_id: '3', quantity: '4' }],
    }, 'indices');
    assert.deepEqual(queryItems(url), [{ service_id: '1', quantity: '2' }, { service_id: '3', quantity: '4' }]);
});
