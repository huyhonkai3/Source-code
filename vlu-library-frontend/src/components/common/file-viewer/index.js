/**
 * File Viewer Components
 *
 * Đường dẫn: src/components/common/file-viewer/index.js
 *
 * Export các component để sử dụng trong toàn bộ ứng dụng:
 * - FileViewer: Smart wrapper (sử dụng component này)
 * - PDFViewer: Component chuyên biệt cho PDF
 * - EpubViewer: Component chuyên biệt cho EPUB
 *
 * Cách sử dụng:
 * ```jsx
 * import { FileViewer } from '../../components/common/file-viewer';
 * // hoặc
 * import FileViewer from '../../components/common/file-viewer/FileViewer';
 * ```
 */

export { default as FileViewer } from "./FileViewer";
export { default as PDFViewer } from "./PDFViewer";
export { default as EpubViewer } from "./EpubViewer";

// Default export là FileViewer (component chính)
export { default } from "./FileViewer";
