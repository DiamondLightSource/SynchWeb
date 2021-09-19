let handleOutsideClick

export default {
  directives: {
    // This is the name we would use to access this directive in a html component.
    // We can access this directive using v-closable
    // el: gives us access to the DOM element that v-closable was attached to.
    // binding: gives us access to the data that is bound by the attribute
    // vnode: gives us access to the current vue component
    closable: {
      bind(el, binding, vnode) {
        handleOutsideClick = (e) => {
          e.stopPropagation()

          // This is the argument that we will assign the v-closable attribute that is bound to the html element
          // excludeElements: Vue refs elements/component that you don't want to trigger closing the combo box
          // handler: method that is called to handle closing the combo-box
          const { handler } = binding.value

          const excludedElementClasses = vnode.context.excludedElementsClass
          const elementClasses = excludedElementClasses.reduce((prev, item, index, array) => {
            if (index < array.length - 1) {
              prev += `.${item}, `
            } else {
              prev += `.${item}`
            }

            return prev
          }, '')
          let clickedOnExcludedElement = false
          document.querySelectorAll(elementClasses).forEach(element => {
            if (!clickedOnExcludedElement) {
              clickedOnExcludedElement = element.contains(e.target) || element.classList.value.split(/\s+/).some(item => e.target.classList.contains(item))
            }
          })

          if (!el.contains(e.target) && !clickedOnExcludedElement) {
            vnode.context[handler]()
          }
        }

        document.addEventListener('click', handleOutsideClick)
        document.addEventListener('touchstart', handleOutsideClick)
      },
      unbind() {
        document.removeEventListener('click', handleOutsideClick)
        document.removeEventListener('touchstart', handleOutsideClick)
      },
    },
  },
}
