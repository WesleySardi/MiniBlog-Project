import { useState, useEffect, useReducer } from "react"
import { db } from '../firebase/config'
import { doc, deleteDoc } from "firebase/firestore"

const initialState = {
    loading: null,
    error: null
}

const deleteReducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return { loading: true, error: null }
        case "DELETED_DOC":
            return { loading: false, error: null }
        case "ERROR":
            return { loading: true, error: action.payload }
        default:
            return state
    }
}

export const useDeleteDocument = (docCollection) => {

    const [response, dispatch] = useReducer(deleteReducer, initialState)

    // deal with memory leak
    const [canceled, setCanceled] = useState(false)

    const checkCanceledBeforeDispatch = (action) => {
        if (!canceled) {
            dispatch(action)
        }
    }

    const deleteDocument = async (id) => {
        checkCanceledBeforeDispatch({
            type: "LOADING"
        })

        try {

            const deletedDocument = await deleteDoc(doc(db, docCollection, id))

            checkCanceledBeforeDispatch({
                type: "DELETED_DOC",
                payload: deletedDocument
            })

        } catch (error) {
            checkCanceledBeforeDispatch({
                type: "ERROR",
                payload: error.message
            })
        }
    }

    useEffect(() => {
        return () => setCanceled(true)
    }, [])

    return { deleteDocument, response }

}