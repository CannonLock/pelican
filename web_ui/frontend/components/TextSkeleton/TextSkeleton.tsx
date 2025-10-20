import { Skeleton, SkeletonProps } from '@mui/material';

const TextSkeleton = ({chars, ...props}: {chars: number} & SkeletonProps) => {
  return (
    <Skeleton
      {...props}
      variant="text"
      sx={{
        ...props.sx,
        fontSize: '1rem',
        width: `${chars}ch`,
      }}
    />
  );
}

export default TextSkeleton;
