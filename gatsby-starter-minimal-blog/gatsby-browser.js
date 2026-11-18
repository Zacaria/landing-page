import { inject } from '@vercel/analytics'

export const onClientEntry = () => {
  inject({
    beforeSend(event) {
      return { ...event, url: event.url.split(/[?#]/, 1)[0] }
    },
  })
}
