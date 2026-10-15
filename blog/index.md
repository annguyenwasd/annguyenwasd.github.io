---
layout: default
lang: vi
title: Bài viết
description: Các ghi chú và hướng dẫn về công nghệ.
permalink: /blog/
---

<h1>Bài viết</h1>

{% for post in site.posts %}
<div class="blog-entry" style="margin: 1.5rem 0 2rem;">
  <p style="font-size: .8rem; opacity: .8;">{{ post.date | date: "%d/%m/%Y" }}</p>
  <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
  <p>{{ post.description }}</p>
</div>
{% endfor %}
