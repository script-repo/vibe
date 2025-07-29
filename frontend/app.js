// Simple note-taking app using localStorage
const LS_KEYS = {
  categories: 'winnotes_categories',
  notes: 'winnotes_notes',
  lastCategoryId: 'winnotes_lastCategoryId',
  lastNoteId: 'winnotes_lastNoteId'
};
let categories = [], notes = [], currentCategoryId = null, editingNoteId = null;
// (functions for loading/saving/rendering omitted for brevity)
document.addEventListener('DOMContentLoaded', () => {
  loadData(); renderCategories(); renderNotes();
});
