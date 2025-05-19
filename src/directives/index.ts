/**
 * Configure and register global directives
 */

import type { App } from 'vue';
import { setupPermissionDirective } from './permission';
import { setupRepeatClickDirective } from './repeatClick';
import { setupDraggableDirective } from './draggable';

export function setupGlobDirectives(app: App) {
  setupPermissionDirective(app);
  setupRepeatClickDirective(app);
  setupDraggableDirective(app)
}