import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextareaAutosize,
    TextField
} from "@mui/material";
import React, {useEffect, useState} from "react";

import {Namespace} from "@/components/Main";
import {PubkeyField, InstitutionField} from "./Fields";

interface CacheFormProps {
    namespace?: Namespace;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<boolean>;
}

const CacheForm = ({
                        namespace,
                        handleSubmit
                    }: CacheFormProps) => {

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        const successfulSubmit = await handleSubmit(e)

        // Clear the form on successful submit
        if (successfulSubmit) {
            window.location.href = "/view/registry/"
        }
    }

    const hostname = namespace?.prefix.replace("/cache/", "") || ""


    return (
        <form onSubmit={onSubmit}>
            <Box pb={2}>
                <TextField
                    required
                    fullWidth
                    size={"small"}
                    id={"prefix"}
                    name={"prefix"}
                    label={"Hostname"}
                    defaultValue={hostname}
                    variant={"outlined"}
                />
            </Box>
            <Box pb={2}>
                <PubkeyField namespace={namespace}/>
            </Box>
            <Box pb={2}>
                <InstitutionField inputInstitution={namespace?.admin_metadata?.institution}/>
            </Box>
            <Box pb={2}>
                <TextField
                    fullWidth
                    size={"small"}
                    id={"description"}
                    name={"description"}
                    label={"Description"}
                    variant={"outlined"}
                    defaultValue={namespace?.admin_metadata?.description || ""}
                />
            </Box>
            <Box pb={2}>
                <TextField
                    fullWidth
                    size={"small"}
                    id={"site-name"}
                    name={"site-name"}
                    label={"Site Name"}
                    variant={"outlined"}
                    defaultValue={namespace?.admin_metadata?.site_name || ""}
                />
            </Box>
            <Box pb={2}>
                <TextField
                    fullWidth
                    size={"small"}
                    id={"Security Contact ID"}
                    name={"security-contact-user-id"}
                    label={"Security Contact ID"}
                    variant={"outlined"}
                    helperText="User Identifier of the user responsible for the security of the service"
                    defaultValue={namespace?.admin_metadata?.security_contact_user_id || ""}
                    placeholder="http://cilogon.org/serverA/users/12345"
                />
            </Box>
            <Box pb={2}>
                <Button type={"submit"} variant={"contained"}>Register</Button>
            </Box>
        </form>
    )
}

export default CacheForm
