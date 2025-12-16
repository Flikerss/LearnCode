import { Box, Container, Grid, Stack } from "@mui/material";
import { Skeleton, SkeletonText } from "./BaseSkeleton.jsx";

export default function AdminPanelSkeleton({ variant = "page" }) {
  const content = (
    <Container maxWidth="lg">
      <SkeletonText height={44} width="40%" sx={{ mb: 3 }} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2.5}>
            <SkeletonText height={24} width="55%" />
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={120} />
            <Skeleton height={160} />
            <Skeleton height={48} width="50%" />
          </Stack>
        </Grid>
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <SkeletonText height={24} width="45%" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={78} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Box component="main" sx={{ py: 6 }} aria-hidden>
      {content}
    </Box>
  );
}
