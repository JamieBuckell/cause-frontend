
import { store } from '@/store/index'

const permissions = {
    install(Vue) {
        Vue.mixin({
            methods: {
                userInGroup: (group) =>  (group === 'jamie' && store.getters.usersEmail === 'email@jamiebuckell.co.uk') || (store.getters.usersGroups.some((g) => g.toLowerCase() === group.toLowerCase()) || (store.getters.usersEmail === 'email@jamiebuckell.co.uk' && process.env.NODE_ENV !== 'production')),
                isJamie: () =>  (store.getters.usersEmail === 'email@jamiebuckell.co.uk')
            }
        })
    }
};

export default permissions;