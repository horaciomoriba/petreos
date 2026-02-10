# Sistema de Diseño - Fortya Admin

## 🎨 Filosofía de Diseño

Dashboard **industrial, minimalista y moderno** con énfasis en:
- ✅ Escala de grises elegante
- ✅ Tipografía clara y legible
- ✅ Espaciado consistente
- ✅ Sombras sutiles
- ✅ Animaciones suaves

## 🎯 Paleta de Colores

### Escala de Grises Principal
```
primary-50:  #f8f9fa  (Muy claro)
primary-100: #f1f3f5
primary-200: #e9ecef
primary-300: #dee2e6
primary-400: #ced4da
primary-500: #adb5bd  (Medio)
primary-600: #868e96
primary-700: #495057
primary-800: #343a40
primary-900: #212529  (Muy oscuro)
primary-950: #0d0f12  (Negro)
```

### Superficies
```
surface-light:  #ffffff  (Blanco)
surface:        #f8f9fa  (Fondo principal)
surface-dark:   #e9ecef
surface-darker: #dee2e6
```

## 📝 Tipografía

### Fuentes
- **Sans-serif**: Inter (400, 500, 600, 700)
- **Monospace**: JetBrains Mono (400)

### Escala de Tamaños
```
text-xs:   0.75rem   (12px)
text-sm:   0.875rem  (14px)
text-base: 1rem      (16px) ← Default
text-lg:   1.125rem  (18px)
text-xl:   1.25rem   (20px)
text-2xl:  1.5rem    (24px)
text-3xl:  1.875rem  (30px)
text-4xl:  2.25rem   (36px)
text-5xl:  3rem      (48px)
```

## 🧩 Componentes Base

### Botones
```jsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-outline">Outline</button>
<button className="btn-ghost">Ghost</button>

// Tamaños
<button className="btn-primary btn-sm">Pequeño</button>
<button className="btn-primary">Normal</button>
<button className="btn-primary btn-lg">Grande</button>
```

### Cards
```jsx
<div className="card">
  <div className="card-header">
    <h3>Título</h3>
  </div>
  <div className="card-body">
    <p>Contenido</p>
  </div>
  <div className="card-footer">
    <button className="btn-primary">Acción</button>
  </div>
</div>
```

### Inputs
```jsx
<div>
  <label className="label">Nombre</label>
  <input className="input" type="text" placeholder="Escribe..." />
</div>

// Variantes
<input className="input input-sm" />
<input className="input input-lg" />
<input className="input input-error" />
```

### Badges
```jsx
<span className="badge-primary">Activo</span>
<span className="badge-secondary">Pendiente</span>
<span className="badge-outline">Inactivo</span>
```

### Alerts
```jsx
<div className="alert-info">Información</div>
<div className="alert-success">Éxito</div>
<div className="alert-warning">Advertencia</div>
<div className="alert-error">Error</div>
```

### Tablas
```jsx
<table className="table">
  <thead>
    <tr>
      <th>Columna 1</th>
      <th>Columna 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dato 1</td>
      <td>Dato 2</td>
    </tr>
  </tbody>
</table>
```

### Loading Spinner
```jsx
<div className="spinner h-8 w-8"></div>
<div className="spinner h-12 w-12"></div>
```

## 📏 Espaciado

Sistema basado en múltiplos de **8px**:
```
spacing-1:  0.25rem  (4px)
spacing-2:  0.5rem   (8px)
spacing-3:  0.75rem  (12px)
spacing-4:  1rem     (16px)
spacing-6:  1.5rem   (24px)
spacing-8:  2rem     (32px)
spacing-12: 3rem     (48px)
```

## 🎭 Sombras

Sombras sutiles para diseño industrial:
```
shadow-sm:  Muy sutil
shadow:     Normal
shadow-md:  Media
shadow-lg:  Grande
shadow-xl:  Extra grande
```

## 🔄 Animaciones

Animaciones suaves y profesionales:
```jsx
<div className="animate-fade-in">Aparece suavemente</div>
<div className="animate-slide-in">Desliza desde arriba</div>
```

## 📦 Utilidades Especiales

### Degradado de texto
```jsx
<h1 className="text-gradient">Texto con degradado</h1>
```

### Patrón de fondo
```jsx
<div className="bg-pattern">Con patrón de cuadrícula</div>
```

### Container personalizado
```jsx
<div className="container-custom">
  Contenido centrado con max-width
</div>
```

### Page Header
```jsx
<div className="page-header">
  <h1 className="page-title">Título de Página</h1>
  <p className="page-subtitle">Subtítulo descriptivo</p>
</div>
```

## 🚀 Uso en Componentes

```jsx
import React from 'react';

const MyComponent = () => {
  return (
    <div className="container-custom">
      <div className="page-header">
        <h1 className="page-title">Mi Página</h1>
        <p className="page-subtitle">Descripción de la página</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Card Title</h2>
        </div>
        <div className="card-body">
          <p className="text-primary-700">Contenido del card</p>
          <button className="btn-primary mt-4">Acción</button>
        </div>
      </div>
    </div>
  );
};
```

## 📱 Responsive Design

Todos los componentes son responsive por defecto:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Se adapta automáticamente al tamaño de pantalla */}
</div>
```

## 🎨 Ver Guía Completa

Para ver todos los componentes en acción:
```jsx
import DesignSystemGuide from './pages/DesignSystemGuide';
```

---

**Mantenido por el equipo de Fortya** 🏭