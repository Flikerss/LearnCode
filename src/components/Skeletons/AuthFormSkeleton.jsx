import { Box, Container, Stack } from "@mui/material";
import { Skeleton, SkeletonText } from "./BaseSkeleton.jsx";

export default function AuthFormSkeleton({ titleWidth = "40%", fields = 3 }) {
  return (
    <Box component="section" className="auth-page" aria-hidden sx={{ py: 6 }}>
      <Container maxWidth="sm">
        <Stack spacing={3} className="auth-container">
          <SkeletonText height={36} width={titleWidth} />
          <Stack spacing={2.5}>
            {Array.from({ length: fields }).map((_, index) => (
              <Box key={index}>
                <SkeletonText height={18} width="35%" sx={{ mb: 1 }} />
                <Skeleton height={48} />
              </Box>
            ))}
            <Skeleton height={48} sx={{ borderRadius: 2 }} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
