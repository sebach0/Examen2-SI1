<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Domain\Auth\Models\Usuario;
use App\Domain\Shared\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Controlador de Autenticación
 * 
 * Maneja el inicio de sesión, cierre de sesión y obtención de datos del usuario autenticado.
 * Utiliza Laravel Sanctum para la autenticación basada en tokens.
 * Registra todas las actividades de autenticación en la bitácora.
 */
class AuthController extends Controller
{
    use LogsActivity;
    /**
     * Iniciar sesión de usuario normal
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function login(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Buscar usuario por nombre de usuario
        $usuario = Usuario::where('username', $request->username)->first();

        // Verificar que el usuario existe y la contraseña es correcta
        if (!$usuario || !Hash::check($request->password, $usuario->password_hash)) {
            // Registrar intento fallido
            $this->logLoginFallido($request->username, 'Credenciales inválidas');
            
            throw ValidationException::withMessages([
                'username' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Verificar que el usuario está activo
        if ($usuario->estado !== 'activo') {
            // Registrar intento fallido por cuenta suspendida
            $this->logLoginFallido($request->username, 'Cuenta suspendida');
            
            throw ValidationException::withMessages([
                'username' => ['Esta cuenta está suspendida.'],
            ]);
        }

        // Cargar las relaciones de roles, permisos y docente
        $usuario->load(['roles.permisos', 'docente']);

        // Crear un token de acceso
        $token = $usuario->createToken('auth-token')->plainTextToken;

        // Autenticar temporalmente para el registro en bitácora
        auth('sanctum')->setUser($usuario);
        
        // Registrar login exitoso
        $this->logLogin($usuario->username);

        return response()->json([
            'user' => $usuario,
            'token' => $token,
            'message' => 'Inicio de sesión exitoso'
        ], 200);
    }

    /**
     * Iniciar sesión de administrador
     * 
     * Verifica que el usuario tenga el rol de "Superadmin"
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function adminLogin(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Buscar usuario por nombre de usuario
        $usuario = Usuario::where('username', $request->username)->first();

        // Verificar que el usuario existe y la contraseña es correcta
        if (!$usuario || !Hash::check($request->password, $usuario->password_hash)) {
            // Registrar intento fallido de admin
            $this->logLoginFallido($request->username, 'Credenciales inválidas (intento admin)');
            
            throw ValidationException::withMessages([
                'username' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Verificar que el usuario está activo
        if ($usuario->estado !== 'activo') {
            // Registrar intento fallido por cuenta suspendida
            $this->logLoginFallido($request->username, 'Cuenta suspendida (intento admin)');
            
            throw ValidationException::withMessages([
                'username' => ['Esta cuenta está suspendida.'],
            ]);
        }

        // Cargar las relaciones de roles, permisos y docente
        $usuario->load(['roles.permisos', 'docente']);

        // Verificar que el usuario tiene el rol de Superadmin
        $esSuperadmin = $usuario->roles->contains(function ($rol) {
            return strtolower($rol->nombre) === 'superadmin';
        });

        if (!$esSuperadmin) {
            // Registrar intento de acceso no autorizado al panel admin
            $this->logLoginFallido($request->username, 'Sin permisos de administrador');
            
            throw ValidationException::withMessages([
                'username' => ['No tienes permisos para acceder al panel de administración.'],
            ]);
        }

        // Crear un token de acceso con habilidades especiales para admin
        $token = $usuario->createToken('admin-token', ['*'])->plainTextToken;

        // Autenticar temporalmente para el registro en bitácora
        auth('sanctum')->setUser($usuario);
        
        // Registrar login exitoso de administrador
        $this->logActivity('LOGIN_ADMIN', "Superadmin '{$usuario->username}' accedió al panel de administración");

        return response()->json([
            'user' => $usuario,
            'token' => $token,
            'message' => 'Inicio de sesión de administrador exitoso'
        ], 200);
    }

    /**
     * Cerrar sesión del usuario autenticado
     * 
     * Revoca el token actual del usuario
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Registrar logout antes de revocar el token
        $this->logLogout();
        
        // Revocar el token actual del usuario
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ], 200);
    }

    /**
     * Obtener datos del usuario autenticado
     * 
     * Retorna la información del usuario con sus roles, permisos y perfil de docente
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        // Obtener el usuario autenticado con sus roles, permisos y docente
        $usuario = $request->user()->load(['roles.permisos', 'docente']);

        return response()->json([
            'user' => $usuario
        ], 200);
    }
}
