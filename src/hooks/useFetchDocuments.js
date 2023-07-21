import { useState, useEffect } from "react"
import { db } from "../firebase/config"
import { collection, query, orderBy, onSnapshot, where, QuerySnapshot } from "firebase/firestore"

export const useFetchDocuments = (docColletion, search = null, uid = null) => {
    const [documents, setDocuments] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)

    // deal with memory leak
    const [canceled, setCanceled] = useState(false)

    useEffect(() => {

        async function loadData() {
            if (canceled) return

            setLoading(true)

            const collectionRef = await collection(db, docColletion)

            try {
                let q

                // busca
                // dashboard

                if (search) {
                    q = await query(collectionRef, where("tagsArray", "array-contains", search), orderBy("createdAt", "desc"))
                } else if (uid) {
                    q = await query(collectionRef, where("uid", "==", uid), orderBy("createdAt", "desc"))
                } else {
                    q = await query(collectionRef, orderBy("createdAt", "desc"))
                }

                await onSnapshot(q, (querySnapshot) => {
                    setDocuments(
                        querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }))
                    )
                })

                setLoading(false)
            } catch (error) {
                console.log(error)
                setError(error.message)

                setLoading(false)
            }
        }

        loadData()
    }, [docColletion, search, uid, canceled])

    useEffect(() => {
        return () => setCanceled(true)
    }, [])

    return { documents, loading, error }
}