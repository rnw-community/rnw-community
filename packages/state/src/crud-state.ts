import { reducer } from 'ts-action';

import { requestActions } from './request-actions';
import { requestReducers } from './request-reducers';
import { requestInitialState, RequestStateInterface } from './request-state.interface';

export interface CrudStateInterface<Rt, Ca, Ra, Ua, Da, Ct = Rt, Ut = Rt, Dt = boolean> {
    create: RequestStateInterface<Ct, Ca>;
    read: RequestStateInterface<Rt, Ra>;
    update: RequestStateInterface<Ut, Ua>;
    delete: RequestStateInterface<Dt, Da>;
}

export const createCrudState = <Rt, Ca, Ra, Ua, Da, Ct = Rt, Ut = Rt, Dt = boolean>(prefix: string) => {
    const createActions = requestActions<Ct, Ca>(`${prefix}Create`);
    const readActions = requestActions<Rt, Ra>(`${prefix}Read`);
    const updateActions = requestActions<Ut, Ua>(`${prefix}Update`);
    const deleteActions = requestActions<Dt, Da>(`${prefix}Delete`);

    const initialState: CrudStateInterface<Rt, Ca, Ra, Ua, Da, Ct, Ut, Dt> = {
        create: requestInitialState,
        read: requestInitialState,
        update: requestInitialState,
        delete: requestInitialState,
    };

    const crudReducer = reducer(
        initialState,
        ...requestReducers<CrudStateInterface<Rt, Ca, Ra, Ua, Da, Ct, Ut, Dt>, 'create'>(createActions, 'create'),
        ...requestReducers<CrudStateInterface<Rt, Ca, Ra, Ua, Da, Ct, Ut, Dt>, 'read'>(readActions, 'read'),
        ...requestReducers<CrudStateInterface<Rt, Ca, Ra, Ua, Da, Ct, Ut, Dt>, 'update'>(updateActions, 'update'),
        ...requestReducers<CrudStateInterface<Rt, Ca, Ra, Ua, Da, Ct, Ut, Dt>, 'delete'>(deleteActions, 'delete')
    );

    const actions = [createActions, readActions, updateActions, deleteActions];

    return [actions, crudReducer];
};
