import React, {useMemo, useRef, useState} from "react";
import {Authenticated, secureFetch} from "@/helpers/login";
import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import {Block, Check, Edit} from "@mui/icons-material";
import Link from "next/link";
import {Alert, Namespace} from "@/components/Main";

import InformationDropdown from "./InformationDropdown";
import {getServerType} from "@/components/Namespace/index";

interface PendingCardProps {
    namespace: Namespace;
    onUpdate: () => void;
    onAlert: (alert: Alert) => void;
    authenticated?: Authenticated
}

export const PendingCard = ({
                                namespace,
                                onUpdate,
                                onAlert,
                                authenticated
                            }: PendingCardProps) => {

    const ref = useRef<HTMLDivElement>(null);
    const [transition, setTransition] = useState<boolean>(false);

    const type = useMemo(() => getServerType(namespace), [namespace])

    const approveNamespace = async (e: React.MouseEvent) => {
        try {
            const response = await secureFetch(`/api/v1.0/registry_ui/namespaces/${namespace.id}/approve`, {
                method: "PATCH"
            })

            if (!response.ok){
                onAlert({severity: "error", message: `Failed to approve namespace: ${namespace.prefix}`})
            } else {
                onUpdate()
                onAlert({severity: "success", message: `Successfully approved namespace: ${namespace.prefix}`})
            }

        } catch (error) {
            console.error(error)
        } finally {
            e.stopPropagation()
        }
    }

    const denyNamespace = async (e: React.MouseEvent) => {
        try {
            const response = await secureFetch(`/api/v1.0/registry_ui/namespaces/${namespace.id}/deny`, {
                method: "PATCH"
            })

            if (!response.ok){
                onAlert({severity: "error", message: `Failed to deny namespace: ${namespace.prefix}`})
            } else {
                onUpdate()
                onAlert({severity: "success", message: `Successfully denied namespace: ${namespace.prefix}`})
            }

        } catch (error) {
            console.error(error)
        } finally {
            e.stopPropagation()
        }
    }

    return (
        <Box>
            <Box sx={{
                cursor: "pointer",
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                border: "solid #ececec 1px",
                borderRadius: transition ? "10px 10px 0px 0px" : 2,
                "&:hover": {
                    bgcolor: "#ececec"
                },
                p: 1
            }}
                 bgcolor={"secondary"}
                 onClick={() => setTransition(!transition)}
            >
                <Box my={"auto"} ml={1}>
                    <Typography>{namespace.prefix}</Typography>
                </Box>
                <Box>
                    { authenticated?.role == "admin" &&
                        <>
                            <Tooltip title={"Deny Registration"}>
                                <IconButton sx={{bgcolor: "#ff00001a", mx: 1}} color={"error"} onClick={(e) => denyNamespace(e)}><Block/></IconButton>
                            </Tooltip>
                            <Tooltip title={"Approve Registration"}>
                                <IconButton sx={{bgcolor: "#2e7d3224", mx: 1}} color={"success"} onClick={(e) => approveNamespace(e)}><Check/></IconButton>
                            </Tooltip>
                        </>
                    }
                    {
                        (authenticated?.role == "admin" || authenticated?.user == namespace.admin_metadata.user_id) &&
                        <Tooltip title={"Edit Registration"}>
                            <Link href={`/registry/${type}/edit/?id=${namespace.id}`}>
                                <IconButton onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                    <Edit/>
                                </IconButton>
                            </Link>
                        </Tooltip>
                    }
                </Box>
            </Box>
            <Box ref={ref}>
                <InformationDropdown adminMetadata={namespace.admin_metadata} transition={transition} parentRef={ref}/>
            </Box>
        </Box>
    )
}

export default PendingCard;