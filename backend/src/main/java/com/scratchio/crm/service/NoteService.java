package com.scratchio.crm.service;

import com.scratchio.crm.entity.Note;
import com.scratchio.crm.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NoteService {

    private final NoteRepository noteRepository;

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public Note getNoteById(Long id) {
        return noteRepository.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));
    }

    public Note createNote(Note note) {
        return noteRepository.save(note);
    }

    public Note updateNote(Long id, Note updatedFields) {
        Note existing = getNoteById(id);
        
        if (updatedFields.getTitle() != null) existing.setTitle(updatedFields.getTitle());
        if (updatedFields.getContent() != null) existing.setContent(updatedFields.getContent());
        if (updatedFields.getPinned() != null) existing.setPinned(updatedFields.getPinned());
        if (updatedFields.getFavorite() != null) existing.setFavorite(updatedFields.getFavorite());
        if (updatedFields.getShared() != null) existing.setShared(updatedFields.getShared());
        if (updatedFields.getArchived() != null) existing.setArchived(updatedFields.getArchived());
        if (updatedFields.getTags() != null) existing.setTags(updatedFields.getTags());
        if (updatedFields.getLinkedRecords() != null) existing.setLinkedRecords(updatedFields.getLinkedRecords());
        if (updatedFields.getActivity() != null) existing.setActivity(updatedFields.getActivity());
        if (updatedFields.getVersions() != null) existing.setVersions(updatedFields.getVersions());
        if (updatedFields.getComments() != null) existing.setComments(updatedFields.getComments());
        if (updatedFields.getSharedWith() != null) existing.setSharedWith(updatedFields.getSharedWith());
        if (updatedFields.getOwner() != null) existing.setOwner(updatedFields.getOwner());
        if (updatedFields.getLastReadAt() != null) existing.setLastReadAt(updatedFields.getLastReadAt());
        
        return noteRepository.save(existing);
    }

    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }
}
