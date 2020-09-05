import { reducer } from 'ts-action';

import { createRequestState } from './create-request-state';
import { RequestStateInterface } from './request-state.interface';

export interface CrudStateInterface<T, Ca, Ra, Ua, Da, La, Ct = T, Ut = T, Dt = boolean, Lt = T[]> {
    create: RequestStateInterface<Ct, Ca>;
    read: RequestStateInterface<T, Ra>;
    update: RequestStateInterface<Ut, Ua>;
    delete: RequestStateInterface<Dt, Da>;
    list: RequestStateInterface<Lt, La>;
}

export const createCrudState = <T, Ca, Ra, Ua, Da, La, Ct = T, Ut = T, Dt = boolean, Lt = T[]>(prefix: string) => {
    type State = CrudStateInterface<T, Ca, Ra, Ua, Da, La, Ct, Ut, Dt, Lt>;

    const [createActions, createReducers, createInitialState] = createRequestState<Ct, Ca, State, 'create'>(
        prefix,
        'create'
    );
    const [readActions, readReducers, readInitialState] = createRequestState<T, Ra, State, 'read'>(prefix, 'read');
    const [updateActions, updateReducers, updateInitialState] = createRequestState<Ut, Ua, State, 'update'>(
        prefix,
        'update'
    );
    const [deleteActions, deleteReducers, deleteInitialState] = createRequestState<Dt, Da, State, 'delete'>(
        prefix,
        'delete'
    );
    const [listActions, listReducers, listInitialState] = createRequestState<Lt, La, State, 'list'>(prefix, 'list');

    const initialState: CrudStateInterface<T, Ca, Ra, Ua, Da, La, Ct, Ut, Dt, Lt> = {
        create: createInitialState,
        read: readInitialState,
        update: updateInitialState,
        delete: deleteInitialState,
        list: listInitialState,
    };

    const crudActions = [createActions, readActions, updateActions, deleteActions, listActions];
    const crudReducer = reducer(
        initialState,
        ...createReducers,
        ...readReducers,
        ...updateReducers,
        ...deleteReducers,
        ...listReducers
    );

    return [crudActions, crudReducer, initialState];
};
