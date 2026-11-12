import { Box } from '@mui/material';
import React from 'react';
import {
  Dropdown,
  InformationSpan,
  NamespaceAdminMetadata,
} from '@/components';
import { getStatusDisplayName } from '@/components/Namespace';
import { formatUserPill } from '@/components/UserPill';
import useUserLookup from '@/hooks/useUserLookup';

interface InformationDropdownProps {
  adminMetadata: NamespaceAdminMetadata;
  transition: boolean;
}

const InformationDropdown = ({
  adminMetadata,
  transition,
}: InformationDropdownProps) => {
  const lookupUser = useUserLookup();
  // Show a user reference by name, falling back to the stored value when it
  // can't be resolved (the viewer can't list users, or the account is gone)
  const userLabel = (ref: string): string =>
    ref ? formatUserPill(lookupUser(ref), ref).primary : '';
  const approvedAt =
    adminMetadata.approved_at == '0001-01-01T00:00:00Z'
      ? ''
      : new Date(Date.parse(adminMetadata.approved_at)).toLocaleString();

  const information = [
    {
      name: 'Owner',
      value: userLabel(adminMetadata.user_id),
    },
    { name: 'Description', value: adminMetadata.description },
    { name: 'Site Name', value: adminMetadata.site_name },
    { name: 'Institution', value: adminMetadata.institution },
    {
      name: 'Security Contact',
      value: userLabel(adminMetadata.security_contact_user_id),
    },
    { name: 'Status', value: getStatusDisplayName(adminMetadata.status) },
    {
      name: 'Approved By',
      value: userLabel(adminMetadata.approver_id),
    },
    { name: 'Approved At', value: approvedAt },
    {
      name: 'Created At',
      value: new Date(Date.parse(adminMetadata.created_at)).toLocaleString(),
    },
    {
      name: 'Updated At',
      value: new Date(Date.parse(adminMetadata.updated_at)).toLocaleString(),
    },
  ];

  return (
    <Dropdown transition={transition}>
      <Box>
        {information.map((info) => (
          <InformationSpan key={info.name} {...info} />
        ))}
      </Box>
    </Dropdown>
  );
};

export default InformationDropdown;
