// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    // Some Angular and promise rules need type information.
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],

      // Angular component conventions.
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-signal-model': 'error',
      '@angular-eslint/prefer-output-emitter-ref': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/computed-must-return': 'error',

      // Dependency injection and component shape.
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-host-metadata-property': 'error',
      '@angular-eslint/consistent-component-styles': 'error',
      '@angular-eslint/relative-url-prefix': 'error',
      '@angular-eslint/use-component-selector': 'error',

      // Lifecycle rules.
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-implicit-take-until-destroyed': 'error',

      // General TypeScript safety.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Promise rules.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Keep the project zoneless. Adding zone.js or zone-based providers changes app behavior.
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/core',
              importNames: ['NgZone', 'provideZoneChangeDetection'],
              message:
                'This app is zoneless. NgZone.runOutsideAngular() is a no-op with no zone to escape, and provideZoneChangeDetection() would silently switch the whole app back to zone-based change detection. For high-frequency work, coalesce signal writes or mutate the DOM in afterRenderEffect() instead.',
            },
          ],
          patterns: [
            {
              group: ['zone.js', 'zone.js/*'],
              message:
                'Do not add zone.js. The app is zoneless and the performance conventions assume it.',
            },
          ],
        },
      ],

      // Public members stay unmarked. Private and protected members should be explicit.
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'forbid' },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'forbid' },
        { selector: 'variable', modifiers: ['destructured'], format: null },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        // Allows private backing fields such as `_items` behind readonly public state.
        {
          selector: ['classProperty', 'classMethod'],
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['classProperty', 'classMethod'],
          modifiers: ['protected'],
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
        },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        // DTO and object-literal keys may follow the API's field names.
        { selector: 'typeProperty', format: null },
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'import', format: null },
      ],
      // Keep classes predictable without enforcing alphabetical order.
      '@typescript-eslint/member-ordering': [
        'error',
        { default: ['signature', 'field', 'constructor', 'method'] },
      ],

      // Empty catches and non-Error throws hide useful failure information.
      'no-empty': ['error', { allowEmptyCatch: false }],
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
    },
  },

  // Keep dependencies pointing inward through the app layers.
  {
    files: ['src/app/features/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/common/http',
              message:
                'A feature never calls HTTP. Depend on a domain port (movie.gateway, collections.repository) and let its adapter own the wire format.',
            },
          ],
          patterns: [
            {
              group: ['@features/*', '@features/*/**'],
              message:
                'A feature must not import from another feature. Cross-feature navigation goes through the Router; shared capability goes through an InjectionToken port declared in shared/.',
            },
            {
              // Relative imports can hide a jump out of the current feature.
              group: ['../../*', '../../**'],
              message:
                'This relative path escapes the feature directory. Anything outside your own feature must be imported through an alias (@shared/*, @domain/*, @core/*) so the boundary stays visible and enforceable.',
            },
          ],
        },
      ],
    },
  },
  {
    // Components nested under feature/<name>/ need two levels to reach their own feature root.
    files: ['src/app/features/*/feature/*/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/common/http',
              message:
                'A feature never calls HTTP. Depend on a domain port (movie.gateway, collections.repository) and let its adapter own the wire format.',
            },
          ],
          patterns: [
            {
              group: ['@features/*', '@features/*/**'],
              message:
                'A feature must not import from another feature. Cross-feature navigation goes through the Router; shared capability goes through an InjectionToken port declared in shared/.',
            },
            {
              group: ['../../../*', '../../../**'],
              message:
                'This relative path escapes the feature directory. Anything outside your own feature must be imported through an alias (@shared/*, @domain/*, @core/*) so the boundary stays visible and enforceable.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/features/*/ui/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/common/http',
              message:
                'A feature never calls HTTP. Depend on a domain port and let its adapter own the wire format.',
            },
          ],
          patterns: [
            {
              group: ['@features/*', '@features/*/**'],
              message:
                'A feature must not import from another feature. Cross-feature navigation goes through the Router.',
            },
            {
              group: ['../../*', '../../**'],
              message:
                'This relative path escapes the feature directory. Import through an alias instead.',
            },
            {
              group: ['../data-access', '../data-access/**'],
              message:
                'ui/ holds dumb presentational components: input()/output() only, no facade. If this component needs data, lift that to the smart component in feature/ and pass it down.',
            },
          ],
        },
      ],

      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/core',
              importNames: ['NgZone', 'provideZoneChangeDetection'],
              message:
                'This app is zoneless. NgZone.runOutsideAngular() is a no-op with no zone to escape, and provideZoneChangeDetection() would silently switch the whole app back to zone-based change detection.',
            },
          ],
          patterns: [
            {
              group: ['@domain/*', '@domain/*/**'],
              allowTypeImports: true,
              message:
                'A dumb component may import domain types (`import type { Movie } from ...`) but never domain values. A value import here is how a port ends up injected into a presentational component.',
            },
            {
              group: ['zone.js', 'zone.js/*'],
              message:
                'Do not add zone.js. The app is zoneless and the performance conventions assume it.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/router',
              message:
                'domain/ is data-access with no UI and no routes. Routing belongs to features/ and layout/.',
            },
            {
              name: '@angular/material',
              message:
                'domain/ has no UI. Angular Material belongs in shared/, features/ or layout/.',
            },
          ],
          patterns: [
            {
              group: [
                '@features/*',
                '@features/*/**',
                '@layout/*',
                '@layout/*/**',
                '@shared/*',
                '@shared/*/**',
              ],
              message:
                'domain/ depends on core/ and nothing else. If a type is needed by both domain/ and shared/, it belongs in core/models — that is why Paginated<T> lives there.',
            },
            {
              group: ['@angular/material/*'],
              message:
                'domain/ has no UI. Angular Material belongs in shared/, features/ or layout/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/core/**/*.ts', 'src/app/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@features/*',
                '@features/*/**',
                '@domain/*',
                '@domain/*/**',
                '**/features/*',
                '**/features/*/**',
                '**/domain/*',
                '**/domain/*/**',
              ],
              message:
                'core/ and shared/ are the inward layers — they must never import from features/ or domain/. If shared UI needs a capability from a domain, declare an InjectionToken port in shared/ and let the outer layer provide the implementation.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/layout/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*', '@features/*/**', '@domain/*', '@domain/*/**'],
              message:
                'layout/ is the app shell. It may use shared/ and core/ only — it hosts the router rather than importing the screens it renders.',
            },
          ],
        },
      ],
    },
  },

  // Template rules.
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-class-binding': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-at-else': 'error',
      '@angular-eslint/template/prefer-at-empty': 'error',
      '@angular-eslint/template/prefer-contextual-for-variables': 'error',
      '@angular-eslint/template/prefer-built-in-pipes': 'error',
      '@angular-eslint/template/no-empty-control-flow': 'error',
      '@angular-eslint/template/no-any': 'error',
      '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],

      // Bound styles are allowed; ngStyle and static style attributes are not.
      '@angular-eslint/template/no-inline-styles': [
        'error',
        { allowNgStyle: false, allowBindToStyle: true },
      ],

      // A button inside a form submits by default, so the type must be explicit.
      '@angular-eslint/template/button-has-type': 'error',

      // Keep template expressions small.
      '@angular-eslint/template/conditional-complexity': ['warn', { maxComplexity: 4 }],
      '@angular-eslint/template/cyclomatic-complexity': ['warn', { maxComplexity: 8 }],
    },
  },

  // Test-only relaxations.
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/use-component-selector': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]);
