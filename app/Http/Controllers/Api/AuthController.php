<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\LoginRequest;

class AuthController extends Controller
{
    /**
     * Gère l'inscription d'un nouvel utilisateur.
     */
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            // Par défaut, le rôle est 'user' et le statut 'active'
        ]);

        // Connecte l'utilisateur immédiatement après l'inscription
 $token = $user->createToken($request->ip() ?? 'auth_token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token
    ], 201);
    }

    /**
     * Gère la connexion d'un utilisateur.
     */
  public function login(Request $request): \Illuminate\Http\JsonResponse // Type hint pour plus de clarté
{
    $credentials = $request->validate([
        'email' => ['required', 'string', 'email'],
        'password' => ['required', 'string'],
    ]);

    if (!Auth::attempt($credentials)) {
        throw ValidationException::withMessages([
            'email' => [trans('auth.failed')],
        ]);
    }

    $user = User::where('email', $credentials['email'])->first();

    // Supprime les anciens tokens pour ne pas les accumuler
    $user->tokens()->delete();

    // Crée un nouveau token pour l'utilisateur
    // Le nom du token est utile pour l'audit, on peut y mettre le nom de l'appareil
    $token = $user->createToken($request->ip() ?? 'auth_token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token
    ]);
}

    /**
     * Gère la déconnexion d'un utilisateur.
     */
   public function logout(Request $request): Response
{
    // Révoque le token qui a été utilisé pour authentifier la requête actuelle
    $request->user()->currentAccessToken()->delete();

    return response()->noContent(); // 204 No Content
}

    /**
     * Récupère l'utilisateur actuellement authentifié.
     */
    public function user(Request $request): Response
    {
        return response([
            'user' => $request->user()
        ], 200); // 200 OK
    }
}
