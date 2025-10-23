package com.example.artmix.repository;

import com.example.artmix.model.Posts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Posts, Long> {

    List<Posts> findAllByOrderByCreatedAtDesc();
}
