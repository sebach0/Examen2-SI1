<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExampleController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'API funcionando correctamente',
            'data' => [
                'framework' => 'Laravel 12',
                'database' => 'PostgreSQL 15',
                'frontend' => 'Next.js 15'
            ]
        ]);
    }
}
