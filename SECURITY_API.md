Resumen de seguridad para las APIs (Firestore)

Propósito
- Documentar las decisiones de seguridad aplicadas a Firestore y el cliente.
- Explicar por qué existe el campo `emailVerified` y cómo se usa.

1) Arquitectura de seguridad aplicada
- Cliente (app): se añadió `ensureEmailVerified(uid)` en `firestoreService.ts`.
  - Propósito: mejorar la UX bloqueando operaciones si el usuario no ha
    verificado su correo y mostrar mensajes amigables.
  - Límite: comprobación *cliente* — puede ser manipulada por un atacante.

- Servidor (reglas Firestore): `firestore.rules` exige que cualquier escritura
  en subcolecciones bajo `/users/{uid}/...` cumpla:
  - `request.auth != null` (usuario autenticado)
  - `request.auth.uid == userId` (propietario)
  - `get(.../users/$(request.auth.uid)).data.emailVerified == true`
  Esto garantiza que solo cuentas con `emailVerified == true` puedan crear
  o modificar recursos personales (materias, tareas).

2) Por qué usar `emailVerified` en Firestore
- Firebase Auth tiene `user.emailVerified`, pero las reglas no pueden leer
  directamente el estado de Auth por cada request. Guardando `emailVerified`
  en el documento de perfil sincronizado (al login o tras confirmación)
  podemos aplicar reglas basadas en ese campo.
- Importante: mantener la sincronización entre Auth y Firestore (se hizo en
  `login.tsx` / `register.tsx` con `actualizarVerificacionCorreo`).

3) Riesgos y mitigaciones
- Riesgo: un cliente malicioso puede omitir `ensureEmailVerified`.
  Mitigación: las reglas de Firestore son la defensa final (autoritatias).
- Riesgo: el campo `emailVerified` puede ser alterado si las reglas permiten
  escrituras irrestrictas en `/users/{uid}`. Mitigación: las reglas solo
  permiten escribir `/users/{uid}` al propio usuario autenticado — si necesita
  control más estricto, considere:
  - Validaciones adicionales en reglas (p.ej. validar shapes, tipos, ranges).
  - Mover operaciones sensibles a Cloud Functions con verificación de claims.
  - Usar Custom Claims en Auth para roles y permisos más robustos.

4) Buenas prácticas adicionales
- No guardar contraseñas en Firestore (no lo haga en producción).
- Usar el emulador de Firebase para probar reglas localmente:

```bash
npm install -g firebase-tools
firebase emulators:start --only firestore,auth
```

- Para desplegar reglas:

```bash
firebase deploy --only firestore:rules
```

5) Manejo de errores en la UI
- El helper `ensureEmailVerified` lanza un error con código `auth/email-not-verified`.
  En la UI, traduzca ese código a un mensaje amigable indicando que el usuario
  debe verificar su correo.

6) Siguientes mejoras recomendadas
- Añadir tests de reglas (Firestore Rules Unit Testing).
- Añadir Cloud Function que sincronice `emailVerified` automáticamente cuando
  cambie el estado en Auth (webhooks o triggers) para evitar dependencias en
  flujos de login manuales.
- Considerar el uso de `request.auth.token` y custom claims si introduce roles.

---
Archivo generado automáticamente por cambios recientes en el proyecto.
