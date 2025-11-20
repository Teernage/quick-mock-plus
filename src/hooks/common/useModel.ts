import { computed } from 'vue'

function useModel<P extends object, K extends keyof P = P extends { modelValue: any } ? 'modelValue' : any>(
  props: P,
  emit: (name: string, ...args: any[]) => void,
  key?: K
) {
  const modelKey = key || ('modelValue' as K)
  const eventKey = `update:${String(modelKey)}`

  const model = computed({
    get() {
      return props[modelKey] as P[K]
    },
    set(val: P[K]) {
      emit(eventKey, val)
    }
  })

  return model
}

export default useModel
