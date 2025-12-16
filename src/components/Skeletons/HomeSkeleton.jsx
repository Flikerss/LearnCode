import { Box, Container, Grid, Stack } from "@mui/material";
import { Skeleton, SkeletonText } from "./BaseSkeleton.jsx";

export default function HomeSkeleton() {
  return (
    <Box component="section" sx={{ py: 8 }} aria-hidden>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={6}>
          <Stack spacing={3} flex={1}>
            <SkeletonText height={52} width="60%" />
            <SkeletonText height={28} width="75%" />
            <Skeleton height={48} width={200} sx={{ borderRadius: 2 }} />
          </Stack>
          <Box flex={1}>
            <Skeleton height={280} />
          </Box>
        </Stack>
        <Grid container spacing={3} sx={{ mt: 6 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Stack spacing={2}>
                <Skeleton height={24} width="55%" />
                <Skeleton height={12} width="90%" />
                <Skeleton height={12} width="85%" />
                <Skeleton height={44} width="50%" />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
