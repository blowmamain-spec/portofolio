<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_root_returns_service_info(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200)
            ->assertJsonStructure(['service', 'docs']);
    }

    public function test_health_endpoint_reports_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson(['status' => 'ok']);
    }
}
