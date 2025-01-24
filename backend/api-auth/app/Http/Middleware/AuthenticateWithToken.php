<?php
namespace App\Http\Middleware;

use Closure;
use App\Models\Utilisateur;

class AuthenticateWithToken
{
    public function handle($request, Closure $next)
    {
        $token = $request->header('Authorization');

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Retirer le préfixe "Bearer " si nécessaire
        $token = str_replace('Bearer ', '', $token);

        // Rechercher un utilisateur avec ce token
        $user = Utilisateur::where('api_token', hash('sha256', $token))->first();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Attacher l'utilisateur au request
        $request->merge(['user' => $user]);

        return $next($request);
    }
}
