import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';

import { Role } from './role';
/// Keep this only if role checks need one shared template API.
@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);

  readonly appHasRole = input.required<readonly Role[]>();

  constructor() {
    effect(() => {
      // Registers the input dependency for future role changes.
      this.appHasRole();

      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.template);
    });
  }
}
