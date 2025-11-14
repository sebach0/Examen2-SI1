<?php

namespace App\Imports;

use App\Domain\Auth\Models\Usuario;
use App\Domain\Auth\Models\Rol;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\WithCustomCsvSettings;
use Maatwebsite\Excel\Validators\Failure;

/**
 * 📥 IMPORTACIÓN DE USUARIOS DESDE EXCEL/CSV
 * ===========================================
 * 
 * Formato esperado del archivo:
 * | nombre | email | ci | rol | password |
 * |--------|-------|----|-----|----------|
 * | Juan   | juan@ | 123| docente | (opcional) |
 * 
 * Columnas requeridas:
 * - nombre: Nombre completo del usuario
 * - email: Email único
 * - ci: Cédula de identidad (opcional, para docentes)
 * - rol: Nombre del rol (admin, docente, coordinador, etc.)
 * - password: Contraseña (opcional, si no se proporciona se genera automáticamente)
 */
class UsuariosImport implements ToCollection, WithCustomCsvSettings
{
    protected $errors = [];
    protected $imported = 0;
    protected $failed = 0;

    /**
     * Configuración personalizada para CSV
     * Esto asegura que los archivos CSV se lean correctamente con UTF-8
     * Nota: Excel en español usa punto y coma (;) como delimitador por defecto
     */
    public function getCsvSettings(): array
    {
        return [
            'delimiter' => ';', // Excel en español usa punto y coma por defecto
            'enclosure' => '"',
            'escape_character' => '\\',
            'input_encoding' => 'UTF-8',
        ];
    }

    /**
     * Procesar la colección de filas
     * Ahora leemos TODAS las filas incluyendo los headers
     */
    public function collection(Collection $rows)
    {
        // Log inicial para debugging
        if (config('app.debug')) {
            \Log::debug('Iniciando collection de importación', [
                'total_filas' => $rows->count(),
                'primera_fila' => $rows->isNotEmpty() ? $rows->first()->toArray() : null
            ]);
        }
        
        // Siempre parsear manualmente para tener control total
        // Esto nos permite manejar cualquier formato de CSV
        $this->parsearCsvManual($rows);
    }
    
    /**
     * Parsear CSV manualmente cuando WithHeadingRow no funciona
     * Esto ocurre cuando el CSV no se parsea correctamente y todo queda en una columna
     */
    protected function parsearCsvManual(Collection $rows)
    {
        $headers = null;
        $headerIndex = -1;
        
        // Log para debugging
        if (config('app.debug')) {
            \Log::debug('Iniciando parseo manual de CSV', [
                'total_filas' => $rows->count(),
                'primera_fila' => $rows->first() ? $rows->first()->toArray() : null
            ]);
        }
        
        // Buscar la fila de encabezados
        // La primera fila (índice 0) DEBE ser los headers
        foreach ($rows as $index => $row) {
            // Convertir la fila a array
            $rowArray = $row instanceof Collection ? $row->toArray() : (is_array($row) ? $row : []);
            
            // Log para debugging
            if (config('app.debug')) {
                \Log::debug('Revisando fila para headers', [
                    'index' => $index,
                    'rowArray' => $rowArray,
                    'count' => count($rowArray),
                    'is_numeric_keys' => !empty($rowArray) && array_keys($rowArray) === range(0, count($rowArray) - 1)
                ]);
            }
            
            // CASO 1: La fila ya está parseada como array numérico (ej: ["nombre","email","ci","rol","password"])
            if (is_array($rowArray) && count($rowArray) > 0) {
                // Verificar si es un array numérico (índices 0, 1, 2, ...)
                $keys = array_keys($rowArray);
                $isNumericArray = !empty($keys) && $keys === range(0, count($rowArray) - 1);
                
                if ($isNumericArray) {
                    // Convertir todos los valores a string y normalizar
                    $valores = array_map(function($v) {
                        return trim((string)$v);
                    }, array_values($rowArray));
                    
                    // Normalizar los valores para comparar
                    $valoresNormalizados = array_map(function($v) {
                        return $this->normalizeKey($v);
                    }, $valores);
                    
                    // Verificar si contiene los headers esperados
                    $headersEsperados = ['nombre', 'email', 'ci', 'rol', 'password'];
                    $headersNormalizados = array_map(function($h) {
                        return $this->normalizeKey($h);
                    }, $headersEsperados);
                    
                    // Verificar si al menos 3 de los headers esperados están presentes
                    $coincidencias = array_intersect($valoresNormalizados, $headersNormalizados);
                    
                    if (count($coincidencias) >= 3) {
                        // Esta es la fila de headers
                        $headers = $valores;
                        $headerIndex = $index;
                        
                        if (config('app.debug')) {
                            \Log::debug('Headers encontrados (array parseado)', [
                                'index' => $index,
                                'headers' => $headers,
                                'coincidencias' => $coincidencias
                            ]);
                        }
                        break;
                    }
                } else {
                    // Es un array asociativo, verificar si tiene las claves esperadas
                    $keysNormalizados = array_map(function($key) {
                        return $this->normalizeKey($key);
                    }, $keys);
                    
                    $headersEsperados = ['nombre', 'email', 'ci', 'rol', 'password'];
                    $headersNormalizados = array_map(function($h) {
                        return $this->normalizeKey($h);
                    }, $headersEsperados);
                    
                    $coincidencias = array_intersect($keysNormalizados, $headersNormalizados);
                    if (count($coincidencias) >= 2) {
                        $headers = $keys;
                        $headerIndex = $index;
                        break;
                    }
                }
            }
            
            // CASO 2: La fila está en una sola columna como string (ej: "nombre;email;ci;rol;password")
            // Obtener el primer valor
            $firstValue = null;
            if (!empty($rowArray)) {
                $firstValue = reset($rowArray);
            }
            
            if (is_string($firstValue) && !empty(trim($firstValue))) {
                $firstValue = trim($firstValue);
                $valorLimpio = trim($firstValue, '"');
                
                // Verificar si contiene las palabras clave de los headers
                $tieneNombre = stripos($valorLimpio, 'nombre') !== false;
                $tieneEmail = stripos($valorLimpio, 'email') !== false;
                $tieneRol = stripos($valorLimpio, 'rol') !== false;
                
                if ($tieneNombre && $tieneEmail) {
                    // Intentar parsear los headers (detecta automáticamente ; o ,)
                    $headersParseados = $this->parsearLineaCsv($firstValue);
                    
                    // Verificar que tenga al menos 3 columnas
                    if (count($headersParseados) >= 3) {
                        $headers = $headersParseados;
                        $headerIndex = $index;
                        
                        if (config('app.debug')) {
                            \Log::debug('Headers encontrados (string parseado)', [
                                'index' => $index,
                                'headers' => $headers,
                                'linea_original' => $firstValue,
                                'delimitador_detectado' => $this->detectarDelimitador($firstValue)
                            ]);
                        }
                        break;
                    }
                }
            }
        }
        
        if (!$headers) {
            // Log detallado del error
            $debugInfo = [
                'total_filas' => $rows->count(),
                'primeras_3_filas' => []
            ];
            
            foreach ($rows->take(3) as $idx => $row) {
                $debugInfo['primeras_3_filas'][] = [
                    'index' => $idx,
                    'data' => $row->toArray()
                ];
            }
            
            \Log::error('No se encontraron headers en CSV', $debugInfo);
            
            throw new \Exception('No se encontraron los encabezados del CSV. Asegúrate de que la primera fila contenga: nombre,email,ci,rol,password. Verifica que el archivo esté guardado como CSV (delimitado por comas) y no como Excel.');
        }
        
        // Normalizar headers
        $headersNormalizados = array_map(function($h) {
            return $this->normalizeKey(trim($h));
        }, $headers);
        
        // Procesar las filas de datos
        foreach ($rows as $index => $row) {
            // Saltar la fila de encabezados
            if ($index === $headerIndex) {
                continue;
            }
            
            $rowArray = $row instanceof Collection ? $row->toArray() : (is_array($row) ? $row : []);
            
            // Si la fila está vacía, saltarla
            if (empty($rowArray)) {
                continue;
            }
            
            try {
                $valores = [];
                
                // CASO 1: La fila ya está parseada como array numérico
                $keys = array_keys($rowArray);
                $isNumericArray = !empty($keys) && $keys === range(0, count($rowArray) - 1);
                
                if ($isNumericArray) {
                    // Ya está parseada, usar directamente
                    $valores = array_map(function($v) {
                        return $v !== null ? trim((string)$v) : '';
                    }, array_values($rowArray));
                    
                    if (config('app.debug')) {
                        \Log::debug('Fila ya parseada (array numérico)', [
                            'fila' => $index + 1,
                            'valores' => $valores
                        ]);
                    }
                } else {
                    // CASO 2: La fila está en una sola columna como string
                    $firstValue = reset($rowArray);
                    
                    if (is_string($firstValue)) {
                        $firstValue = trim($firstValue);
                        
                        // Si la fila está vacía, saltarla
                        if (empty($firstValue)) {
                            continue;
                        }
                        
                        // Parsear la línea CSV (maneja comillas alrededor de toda la línea)
                        $valores = $this->parsearLineaCsv($firstValue);
                        
                        if (config('app.debug')) {
                            \Log::debug('Fila parseada desde string', [
                                'fila' => $index + 1,
                                'linea_original' => $firstValue,
                                'valores_parseados' => $valores
                            ]);
                        }
                    } else {
                        // CASO 3: Array asociativo, convertir a array numérico
                        $valores = array_values($rowArray);
                    }
                }
                
                // Crear un array asociativo con los headers
                $rowData = [];
                foreach ($headersNormalizados as $i => $header) {
                    $rowData[$header] = isset($valores[$i]) ? trim((string)$valores[$i]) : null;
                }
                
                // También agregar las claves originales para compatibilidad
                foreach ($headers as $i => $headerOriginal) {
                    $headerOriginalNormalizado = $this->normalizeKey(trim($headerOriginal));
                    if (!isset($rowData[$headerOriginalNormalizado])) {
                        $rowData[$headerOriginalNormalizado] = isset($valores[$i]) ? trim((string)$valores[$i]) : null;
                    }
                    // También agregar la clave original sin normalizar
                    $rowData[$headerOriginal] = isset($valores[$i]) ? trim((string)$valores[$i]) : null;
                }
                
                // Convertir a Collection para usar el mismo método importRow
                $rowCollection = collect($rowData);
                
                if (config('app.debug')) {
                    \Log::debug('Procesando fila CSV', [
                        'fila' => $index + 1,
                        'headers' => $headers,
                        'valores' => $valores,
                        'rowData' => $rowData
                    ]);
                }
                
                $this->importRow($rowCollection);
                $this->imported++;
            } catch (\Exception $e) {
                $this->failed++;
                // Calcular el número de fila correcto (index + 1 porque empezamos desde 0, pero la fila 1 es el header)
                $numeroFila = $index + 1;
                $this->errors[] = [
                    'fila' => $numeroFila,
                    'error' => $e->getMessage(),
                    'datos' => $rowArray
                ];
            }
        }
    }
    
    /**
     * Detectar el delimitador usado en una línea CSV
     * Excel en español usa punto y coma (;) por defecto, pero también puede usar comas (,)
     */
    protected function detectarDelimitador(string $linea): string
    {
        // Contar ocurrencias de cada delimitador potencial
        $delimitadores = [';', ','];
        $conteos = [];
        
        foreach ($delimitadores as $delim) {
            // Contar solo delimitadores que NO estén dentro de comillas
            $dentroComillas = false;
            $count = 0;
            for ($i = 0; $i < strlen($linea); $i++) {
                if ($linea[$i] === '"') {
                    // Si hay comillas dobles, es una comilla escapada
                    if ($i + 1 < strlen($linea) && $linea[$i + 1] === '"') {
                        $i++; // Saltar la siguiente comilla
                        continue;
                    }
                    $dentroComillas = !$dentroComillas;
                } elseif ($linea[$i] === $delim && !$dentroComillas) {
                    $count++;
                }
            }
            $conteos[$delim] = $count;
        }
        
        // Retornar el delimitador con más ocurrencias
        // Si hay empate o ambos son 0, preferir punto y coma (Excel español)
        if ($conteos[';'] >= $conteos[',']) {
            return ';';
        }
        return ',';
    }
    
    /**
     * Parsear una línea CSV respetando comillas y delimitadores
     * Maneja casos donde:
     * - La línea completa está entre comillas: "nombre;email;ci;rol;password"
     * - Valores individuales están entre comillas: "Juan Pérez";"email@test.com"
     * - Comillas escapadas: "Juan ""Pérez"""
     * - Delimitadores: punto y coma (;) o comas (,)
     */
    protected function parsearLineaCsv(string $linea): array
    {
        // Limpiar la línea: eliminar espacios al inicio y final
        $linea = trim($linea);
        
        // Detectar el delimitador usado
        $delimitador = $this->detectarDelimitador($linea);
        
        // Si la línea completa está entre comillas (caso: "nombre;email;ci;rol;password")
        // Necesitamos detectar si toda la línea está entre comillas o solo valores individuales
        if (strlen($linea) >= 2 && $linea[0] === '"' && $linea[strlen($linea) - 1] === '"') {
            // Contar comillas no escapadas para determinar si toda la línea está entre comillas
            $comillasNoEscapadas = 0;
            $i = 0;
            while ($i < strlen($linea)) {
                if ($linea[$i] === '"') {
                    // Si la siguiente también es comilla, es una comilla escapada
                    if ($i + 1 < strlen($linea) && $linea[$i + 1] === '"') {
                        $i += 2; // Saltar ambas comillas
                        continue;
                    } else {
                        $comillasNoEscapadas++;
                    }
                }
                $i++;
            }
            
            // Si hay exactamente 2 comillas (inicio y final), toda la línea está entre comillas
            if ($comillasNoEscapadas === 2) {
                // Eliminar las comillas exteriores
                $linea = substr($linea, 1, -1);
            }
        }
        
        $valores = [];
        $valorActual = '';
        $dentroComillas = false;
        $longitud = strlen($linea);
        
        for ($i = 0; $i < $longitud; $i++) {
            $caracter = $linea[$i];
            
            if ($caracter === '"') {
                // Si estamos dentro de comillas y el siguiente carácter también es comilla, es una comilla escapada
                if ($dentroComillas && $i + 1 < $longitud && $linea[$i + 1] === '"') {
                    $valorActual .= '"';
                    $i++; // Saltar la siguiente comilla
                } else {
                    // Toggle del estado de comillas
                    $dentroComillas = !$dentroComillas;
                }
            } elseif ($caracter === $delimitador && !$dentroComillas) {
                // Delimitador encontrado fuera de comillas (puede ser ; o ,)
                $valores[] = trim($valorActual);
                $valorActual = '';
            } else {
                $valorActual .= $caracter;
            }
        }
        
        // Agregar el último valor
        $valores[] = trim($valorActual);
        
        return $valores;
    }

    /**
     * Verificar si una fila está completamente vacía
     */
    protected function isRowEmpty(Collection $row): bool
    {
        foreach ($row->toArray() as $value) {
            if (!empty($value) && trim($value) !== '') {
                return false;
            }
        }
        return true;
    }

    /**
     * Importar una fila individual
     */
    protected function importRow(Collection $row)
    {
        // Log detallado para debugging
        if (config('app.debug')) {
            \Log::debug('Importando fila', [
                'row_keys' => $row->keys()->toArray(),
                'row_values' => $row->toArray(),
            ]);
        }
        
        // Normalizar nombres de columnas (case insensitive)
        $nombre = $this->getValue($row, ['nombre', 'name', 'nombres']);
        $email = $this->getValue($row, ['email', 'correo', 'e-mail']);
        $ci = $this->getValue($row, ['ci', 'cedula', 'cedula_identidad']);
        $rolNombre = $this->getValue($row, ['rol', 'role', 'tipo']);
        $password = $this->getValue($row, ['password', 'contraseña', 'pass']);

        // Log de valores obtenidos
        if (config('app.debug')) {
            \Log::debug('Valores extraídos de la fila', [
                'nombre' => $nombre,
                'email' => $email,
                'ci' => $ci,
                'rol' => $rolNombre,
                'password' => $password ? '***' : '(vacío)',
            ]);
        }

        // Limpiar valores (trim y convertir a string)
        $nombre = $nombre ? trim((string)$nombre) : '';
        $email = $email ? trim((string)$email) : '';
        $ci = $ci ? trim((string)$ci) : null;
        $rolNombre = $rolNombre ? trim((string)$rolNombre) : '';
        $password = $password ? trim((string)$password) : null;

        // Validar que existan los campos requeridos
        if (empty($nombre) || empty($email) || empty($rolNombre)) {
            $camposFaltantes = [];
            if (empty($nombre)) $camposFaltantes[] = 'nombre';
            if (empty($email)) $camposFaltantes[] = 'email';
            if (empty($rolNombre)) $camposFaltantes[] = 'rol';
            
            // Mensaje de error más descriptivo
            $mensaje = 'Faltan campos requeridos: ' . implode(', ', $camposFaltantes);
            
            // Agregar información sobre las columnas disponibles
            $columnasDisponibles = $row->keys()->toArray();
            if (!empty($columnasDisponibles)) {
                $mensaje .= '. Columnas detectadas en el archivo: ' . implode(', ', $columnasDisponibles);
            } else {
                $mensaje .= '. No se detectaron columnas en el archivo.';
            }
            
            // Agregar los valores que se intentaron leer
            $mensaje .= ' Valores leídos: nombre=' . ($nombre ?: '(vacío)') . 
                       ', email=' . ($email ?: '(vacío)') . 
                       ', rol=' . ($rolNombre ?: '(vacío)');
            
            throw new \Exception($mensaje);
        }

        // Validar formato de email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("El email '{$email}' no tiene un formato válido");
        }

        // Verificar si el usuario ya existe
        $usuarioExistente = Usuario::where('email', $email)
            ->orWhere('username', $this->generateUsername($nombre, $email))
            ->first();

        if ($usuarioExistente) {
            throw new \Exception("El usuario con email '{$email}' ya existe");
        }

        // Obtener el rol
        $rol = Rol::where('nombre', $rolNombre)->first();
        if (!$rol) {
            throw new \Exception("El rol '{$rolNombre}' no existe");
        }

        // Generar username único
        $username = $this->generateUsername($nombre, $email);

        // Generar password si no se proporciona
        if (empty($password)) {
            $password = Str::random(12); // Password temporal
        }

        // Crear usuario
        $usuario = Usuario::create([
            'id' => (string) Str::uuid(),
            'username' => $username,
            'email' => $email,
            'password_hash' => Hash::make($password),
            'estado' => 'activo',
        ]);

        // Asignar rol
        $usuario->roles()->attach($rol->id);

        // Si tiene CI, crear perfil de docente (opcional, según tu lógica)
        if (!empty($ci)) {
            // Aquí podrías crear el perfil de docente si existe la relación
            // Por ahora solo creamos el usuario
        }
    }

    /**
     * Obtener valor de una columna (case insensitive y con normalización)
     */
    protected function getValue(Collection $row, array $possibleKeys)
    {
        // Primero, obtener todas las claves disponibles en la fila
        $availableKeys = $row->keys()->map(function ($key) {
            // Normalizar la clave: eliminar BOM, espacios, caracteres especiales
            return $this->normalizeKey($key);
        })->toArray();
        
        // Crear un mapa de claves normalizadas a valores originales
        $keyMap = [];
        foreach ($row->keys() as $originalKey) {
            $normalized = $this->normalizeKey($originalKey);
            if (!isset($keyMap[$normalized])) {
                $keyMap[$normalized] = $originalKey;
            }
        }
        
        foreach ($possibleKeys as $key) {
            // Buscar con diferentes variaciones
            $variations = [
                $key,
                strtolower($key),
                strtoupper($key),
                ucfirst($key),
                ucwords($key),
                str_replace('_', ' ', $key),
                str_replace(' ', '_', $key),
                $this->normalizeKey($key),
            ];

            foreach ($variations as $variation) {
                $normalizedVariation = $this->normalizeKey($variation);
                
                // Buscar en las claves normalizadas
                if (in_array($normalizedVariation, $availableKeys)) {
                    $originalKey = $keyMap[$normalizedVariation];
                    $value = $row->get($originalKey);
                    
                    // Convertir a string y limpiar
                    if ($value === null || $value === '') {
                        return null;
                    }
                    
                    // Limpiar el valor: eliminar BOM, espacios, caracteres de control
                    $cleanedValue = $this->cleanValue($value);
                    return $cleanedValue;
                }
                
                // También intentar con la clave original
                if ($row->has($variation)) {
                    $value = $row->get($variation);
                    if ($value === null || $value === '') {
                        return null;
                    }
                    return $this->cleanValue($value);
                }
            }
        }

        return null;
    }

    /**
     * Normalizar una clave (eliminar BOM, espacios, caracteres especiales)
     */
    protected function normalizeKey($key): string
    {
        if (!is_string($key)) {
            $key = (string) $key;
        }
        
        // Eliminar BOM UTF-8 si existe
        $key = preg_replace('/^\xEF\xBB\xBF/', '', $key);
        
        // Eliminar espacios al inicio y final
        $key = trim($key);
        
        // Convertir a minúsculas para comparación case-insensitive
        $key = mb_strtolower($key, 'UTF-8');
        
        // Normalizar espacios y guiones bajos
        $key = preg_replace('/[\s_]+/', '_', $key);
        
        return $key;
    }

    /**
     * Limpiar un valor (eliminar BOM, espacios, caracteres de control)
     */
    protected function cleanValue($value): string
    {
        if (!is_string($value)) {
            $value = (string) $value;
        }
        
        // Eliminar BOM UTF-8 si existe
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
        
        // Eliminar espacios al inicio y final
        $value = trim($value);
        
        // Eliminar caracteres de control excepto saltos de línea y tabs
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
        
        return $value;
    }

    /**
     * Generar username único a partir del nombre
     */
    protected function generateUsername(string $nombre, string $email): string
    {
        // Extraer primera parte del email como base
        $base = explode('@', $email)[0];
        
        // Limpiar y normalizar
        $base = Str::slug($base, '');
        $base = strtolower($base);
        
        // Verificar si ya existe
        $username = $base;
        $counter = 1;
        while (Usuario::where('username', $username)->exists()) {
            $username = $base . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * Reglas de validación
     * Nota: Estas reglas se aplican ANTES de que se procese la fila
     * Por eso usamos validación manual en importRow() para mejor control
     */
    public function rules(): array
    {
        return [
            'nombre' => 'nullable|string|max:255', // nullable porque validamos manualmente
            'email' => 'nullable|email|max:255',
            'ci' => 'nullable|string|max:20',
            'rol' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:6',
        ];
    }

    /**
     * Manejar fallos de validación
     */
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->failed++;
            $this->errors[] = [
                'fila' => $failure->row(),
                'atributo' => $failure->attribute(),
                'errores' => $failure->errors(),
                'valores' => $failure->values(),
            ];
        }
    }

    /**
     * Obtener estadísticas de la importación
     */
    public function getStats(): array
    {
        return [
            'importados' => $this->imported,
            'fallidos' => $this->failed,
            'errores' => $this->errors,
        ];
    }
}



