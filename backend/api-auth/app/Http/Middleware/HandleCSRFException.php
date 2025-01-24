<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HandleCSRFException
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    protected $except = [
        'api/*', // Désactiver CSRF pour toutes les routes sous /api
        'webhook/*', // Exemple d'exclusion pour des webhooks
    ];
    
    public function handle($request, \Closure $next)
    {
        return $next($request);
    }
    
}
