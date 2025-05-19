/**
 * Global authority directive
 * Used for fine-grained control of component permissions
 * @Example v-auth="'Admin'"
 */

import type { App, Directive, DirectiveBinding } from 'vue';

const role:Array<string> = []

const checkPermission = (val:string) => {
  if(role.includes(val)) {
    return true;
  }
  return false
}

const mounted = (el: any, binding: DirectiveBinding<any>) => {
  if(binding.value) {
    const hasPermission = checkPermission(binding.value);
    if(!hasPermission) {
      el.parentNode?.removeChild(el);
    }
  }
}

const authDirective: Directive = {
  mounted,
}

export function setupPermissionDirective(app: App) {
  app.directive('auth', authDirective);
}

export default authDirective;