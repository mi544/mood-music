import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

/**
 * Determines side on which tippy.js will show the pop-ups
 * based on screen resolution
 * @returns {string} placement
 */
const getBoxPlacementSide = () => {
  if (window.matchMedia('(max-width: 769px)').matches) {
    return 'bottom'
  } else {
    return 'right'
  }
}

/**
 * Initializes tippy.js element
 * @param {string} selector - CSS selector of an element to initialize as a tippy.js pop-up
 * @param {string} text - Text to display on the initialized pop-up
 * @param {string} placement - Side on which tippy.js will show the pop-up
 * @returns {string} placement
 */
const initTippyBoxWithEl = (selector, text, placement) => {
  const tippyConfig = {
    content: text,
    animation: 'perspective-extreme',
    placement: placement,
    maxWidth: 200,
    trigger: 'manual',
    delay: [500, 200],
  }

  const tippyEl = tippy(document.querySelector(selector), tippyConfig)

  return tippyEl
}

/**
 * Initializes tippy.js element
 * @param {*} tippyBoxInstance - Tippy box instance to perform actions on
 * @param {number} showDelay - Time in ms to wait before showing the tippy box
 * @param {number} hideDelay - Time in ms to wait before hiding the tippy box back
 */
const showTippyBox = (tippyBoxInstance, showDelay, hideDelay) => {
  setTimeout(() => tippyBoxInstance.show(), showDelay)
  setTimeout(() => tippyBoxInstance.hide(), hideDelay)
}

export { getBoxPlacementSide, initTippyBoxWithEl, showTippyBox }
