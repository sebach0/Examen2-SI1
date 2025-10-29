<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

/**
 * Middleware para confiar en proxies (Azure Application Gateway, Load Balancers, etc.)
 * 
 * Esto es CRÍTICO para Azure ya que las requests pasan por:
 * Cliente → Application Gateway → Container → Laravel
 * 
 * Sin esto, la IP siempre sería la del gateway interno.
 */
class TrustProxies extends Middleware
{
    /**
     * Los proxies de confianza para esta aplicación.
     * 
     * En Azure, usar "*" para confiar en todos los proxies de Azure.
     * En producción específica, listar IPs exactas por seguridad.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*'; // Acepta todos los proxies (necesario para Azure)

    /**
     * Los headers que deben usarse para detectar proxies.
     * 
     * Azure Application Gateway usa estos headers:
     * - X-Forwarded-For: IP del cliente real
     * - X-Forwarded-Proto: Protocolo (http/https)
     * - X-Forwarded-Host: Host original
     * - X-Forwarded-Port: Puerto original
     *
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB; // Compatibilidad con AWS si migran
}
