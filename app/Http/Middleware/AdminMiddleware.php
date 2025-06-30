<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifie si l'utilisateur est authentifié ET si son rôle est 'admin'
        if (Auth::check() && Auth::user()->role === 'admin') {
            return $next($request);
        }

        // Sinon, renvoyer une erreur 403 Forbidden
        return response()->json(['message' => 'Accès non autorisé.'], 403);
    }
}