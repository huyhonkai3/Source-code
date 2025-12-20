import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import DocumentCard from "./DocumentCard";
import documentsAPI from "../../api/documents.api";

/**
 * RelatedDocuments Component
 * Hiển thị tài liệu cùng danh mục
 */
const RelatedDocuments = ({ categoryId, currentDocId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRelated = useCallback(async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await documentsAPI.getRelated(
        categoryId,
        currentDocId,
        4,
      );

      if (response.status === "success") {
        setDocuments(response.data?.documents || []);
      }
    } catch (error) {
      console.error("Fetch related error:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, currentDocId]);

  useEffect(() => {
    fetchRelated();
  }, [fetchRelated]);

  if (!categoryId || (!loading && documents.length === 0)) {
    return null;
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ mb: 3, pb: 2, borderBottom: "2px solid", borderColor: "divider" }}
      >
        Tài liệu cùng danh mục
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {documents.map((doc) => (
            <Grid item xs={12} sm={6} md={3} key={doc._id || doc.id}>
              <DocumentCard document={doc} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default RelatedDocuments;
