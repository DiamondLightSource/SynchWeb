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
          const { handler, excludeElements } = binding.value

          let clickedOnExcludedElement = false
          excludeElements.forEach((refName) => {
            if (!clickedOnExcludedElement) {
              const excludedElement = vnode.context.$refs[refName]

              // Vue 2 wraps each refs in a v-for loop in an array. The ref value is returned as an array with one element, so we are checking for that as well
              // and then we can successfully check if the ref has been clicked or not.
              // This is weird but has been fixed in Vue 3.

              // If adding a ref to a v-for element,
              if (typeof excludedElement !== 'undefined' && Array.isArray(excludedElement)) {
                clickedOnExcludedElement = excludedElement[0] && excludedElement[0].contains(e.target)
              } else if (typeof excludedElement !== 'undefined' && !Array.isArray(excludedElement)) {
                clickedOnExcludedElement = excludedElement.contains(e.target)
              }
            }
          })

          const searchInputElement = e.target.classList.contains(vnode.context.searchInputClassName)

          if (!el.contains(e.target) && !clickedOnExcludedElement && !searchInputElement) {
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
