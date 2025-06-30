<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use App\Http\Controllers\Api\CriminalController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SurvivalAlertController;


Route::post('/criminals/{criminal}/report', [ReportController::class, 'store']);
Route::middleware([
    AddQueuedCookiesToResponse::class,
    StartSession::class,
    ShareErrorsFromSession::class,
])->group(function(){
// Routes d'authentification publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par l'authentification Sanctum
Route::middleware('auth.session')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
       Route::middleware('admin')->group(function () {
        // ...
        // Route pour que les admins voient tous les signalements
        Route::get('/reports', [ReportController::class, 'index']);
        // Plus tard, on ajoutera des routes pour valider/rejeter les signalements
        // Route::patch('/reports/{report}/verify', [ReportController::class, 'verify']);
    });
    // D'autres routes protégées viendront ici...
});
Route::middleware('auth:session')->group(function () {
    // ... Routes de logout et user

    // Routes pour les criminels (accessibles à tous les utilisateurs connectés pour la lecture)
    Route::get('/criminals', [CriminalController::class, 'index']);
    Route::get('/criminals/{criminal}', [CriminalController::class, 'show']);

    // Routes CRUD pour les criminels (protégées pour les admins)
    Route::middleware('admin')->group(function () {
        Route::post('/criminals', [CriminalController::class, 'store']);
        Route::put('/criminals/{criminal}', [CriminalController::class, 'update']);
        Route::delete('/criminals/{criminal}', [CriminalController::class, 'destroy']);
        // Nous pourrions ajouter une route POST spécifique pour l'update avec des fichiers
        // Route::post('/criminals/{criminal}', [CriminalController::class, 'updateWithPhotos']);
    });
        Route::prefix('survival-alert')->group(function() {
        // Obtenir et mettre à jour la configuration de l'alerte
        Route::get('/', [SurvivalAlertController::class, 'show']);
        Route::put('/', [SurvivalAlertController::class, 'update']);

        // Déclencher l'alerte (via l'interface web ou l'API)
        Route::post('/trigger', [SurvivalAlertController::class, 'trigger']);
    });
});
});
Route::get('/criminals', [CriminalController::class, 'index']);
Route::get('/criminals/{criminal}', [CriminalController::class, 'show']);
