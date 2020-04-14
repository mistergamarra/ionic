import { addEventListener } from './listener';

const MOUSE_WAIT = 2000;

export const createPointerEvents = (
  el: Node,
  pointerDown: any,
  pointerMove: any,
  pointerUp: any,
  options: EventListenerOptions
) => {

  let rmTouchStart: (() => void) | undefined;
  let rmTouchMove: (() => void) | undefined;
  let rmTouchEnd: (() => void) | undefined;
  let rmTouchCancel: (() => void) | undefined;
  let rmMouseStart: (() => void) | undefined;
  let rmMouseMove: (() => void) | undefined;
  let rmMouseUp: (() => void) | undefined;
  let rmPointerDown: (() => void) | undefined;
  let rmPointerMove: (() => void) | undefined;
  let rmPointerUp: (() => void) | undefined;
  let rmPointerCancel: (() => void) | undefined;
  let lastTouchEvent = 0;

  const handleTouchStart = (ev: any) => {
    lastTouchEvent = Date.now() + MOUSE_WAIT;
    if (!pointerDown(ev)) {
      return;
    }
    if (!rmTouchMove && pointerMove) {
      rmTouchMove = addEventListener(el, 'touchmove', pointerMove, options);
    }
    if (!rmTouchEnd) {
      rmTouchEnd = addEventListener(el, 'touchend', handleTouchEnd, options);
    }
    if (!rmTouchCancel) {
      rmTouchCancel = addEventListener(el, 'touchcancel', handleTouchEnd, options);
    }
  };

  const handleMouseDown = (ev: any) => {
    if (lastTouchEvent > Date.now()) {
      return;
    }
    if (!pointerDown(ev)) {
      return;
    }
    if (!rmMouseMove && pointerMove) {
      rmMouseMove = addEventListener(getDocument(el), 'mousemove', pointerMove, options);
    }
    if (!rmMouseUp) {
      rmMouseUp = addEventListener(getDocument(el), 'mouseup', handleMouseUp, options);
    }
  };

  const handlePointerDown = (ev: any) => {
    lastTouchEvent = Date.now() + MOUSE_WAIT;
    if (!pointerDown(ev)) {
      return;
    }
    if (!rmPointerMove && pointerMove) {
      rmPointerMove = addEventListener(el, 'pointermove', pointerMove, options);
    }
    if (!rmPointerUp) {
      rmPointerUp = addEventListener(el, 'pointerup', handlePointerUp, options);
    }
    if (!rmPointerCancel) {
      rmPointerCancel = addEventListener(el, 'pointercancel', handlePointerUp, options);
    }
  };

  const handleTouchEnd = (ev: any) => {
    stopTouch();
    if (pointerUp) {
      pointerUp(ev);
    }
  };

  const handleMouseUp = (ev: any) => {
    stopMouse();
    if (pointerUp) {
      pointerUp(ev);
    }
  };

  const handlePointerUp = (ev: any) => {
    stopPointer();
    if (pointerUp) {
      pointerUp(ev);
    }
  };

  const stopTouch = () => {
    if (rmTouchMove) {
      rmTouchMove();
    }
    if (rmTouchEnd) {
      rmTouchEnd();
    }
    if (rmTouchCancel) {
      rmTouchCancel();
    }
    rmTouchMove = rmTouchEnd = rmTouchCancel = undefined;
  };

  const stopMouse = () => {
    if (rmMouseMove) {
      rmMouseMove();
    }
    if (rmMouseUp) {
      rmMouseUp();
    }
    rmMouseMove = rmMouseUp = undefined;
  };

  const stopPointer = () => {
    if (rmPointerMove) {
      rmPointerMove();
    }
    if (rmPointerUp) {
      rmPointerUp();
    }
    if (rmPointerCancel) {
      rmPointerCancel();
    }
    rmPointerMove = rmPointerUp = rmPointerCancel = undefined;
  };

  const stop = () => {
    stopTouch();
    stopMouse();
    stopPointer();
  };

  const enable = (isEnabled = true) => {
    if (!isEnabled) {
      if (rmTouchStart) {
        rmTouchStart();
      }
      if (rmMouseStart) {
        rmMouseStart();
      }
      if (rmPointerDown) {
        rmPointerDown();
      }
      rmTouchStart = rmMouseStart = rmPointerDown = undefined;
      stop();

    } else {
      if (supportsPointerEvents()) {
        if (!rmPointerDown) {
          rmPointerDown = addEventListener(el, 'pointerdown', handlePointerDown, options);
        }
      } else {
        if (!rmTouchStart) {
          rmTouchStart = addEventListener(el, 'touchstart', handleTouchStart, options);
        }
        if (!rmMouseStart) {
          rmMouseStart = addEventListener(el, 'mousedown', handleMouseDown, options);
        }
      }
    }
  };

  const destroy = () => {
    enable(false);
    pointerUp = pointerMove = pointerDown = undefined;
  };

  return {
    enable,
    stop,
    destroy
  };
};

const supportsPointerEvents = () => {
  return (
    typeof (document as any) !== 'undefined' &&
    'onpointerdown' in document
  );
};

const getDocument = (node: Node) => {
  return node instanceof Document ? node : node.ownerDocument;
};

export interface PointerEventsConfig {
  element?: HTMLElement;
  pointerDown: (ev: any) => boolean;
  pointerMove?: (ev: any) => void;
  pointerUp?: (ev: any) => void;
  zone?: boolean;
  capture?: boolean;
  passive?: boolean;
}
