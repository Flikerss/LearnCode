import { Box, Container, Grid, Stack } from "@mui/material";
import { Skeleton, SkeletonText } from "./BaseSkeleton.jsx";

export default function AboutSkeleton() {
  return (
    <Box component="section" sx={{ py: 8 }} aria-hidden>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <SkeletonText height={44} width="40%" />
          <SkeletonText height={16} width="80%" />
          <SkeletonText height={16} width="72%" />
        </Stack>
        <Grid container spacing={3} sx={{ mt: 6 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Stack spacing={2} alignItems="center">
                <Skeleton height={96} width={96} sx={{ borderRadius: "50%" }} />
                <SkeletonText height={18} width="60%" />
                <SkeletonText height={14} width="70%" />
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3} sx={{ mt: 6 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Stack spacing={1.5}>
                <SkeletonText height={20} width="40%" />
                <SkeletonText height={14} width="80%" />
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Stack spacing={2} sx={{ mt: 6 }}>
          <SkeletonText height={26} width="35%" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={48} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
