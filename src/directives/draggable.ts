/**
 * mouse Drag event
 * need add position 'relative' in parent node
 * @Example v-draggable
 */

import type {App, Directive } from 'vue';

const draggableDirective: Directive = {
  mounted(el: any) {
    el.style.position = "absolute";
    el.style.cursor = 'move';
    el.onmousedown = () => {
      document.onmousemove = (e:any) => {
        let x = e.pageX;
        let y = e.pageY;
        let maxX = document.body.clientWidth 
        let maxY = document.body.clientHeight
        if (x < 0) {
          x = 0
        } else if (x > maxX) {
          x = maxX
        }

        if (y < 0) {
          y = 0
        } else if (y > maxY) {
          y = maxY
        }
        
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      }
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null
      }
    }
  },
}

export function setupDraggableDirective(app: App) {
  app.directive('draggable', draggableDirective);
}

export default draggableDirective;