---
layout: default
description: Blog posts by An Nguyen Van Chuc
---

<div class="post-summary">
    {% for post in site.posts %}
    <span class="post-item"><span class="mobile-hide">{{ post.date | date: '%Y-%m-%d' }} &gt;&gt; </span><a href="{{ post.url | relative_url }}">{{ post.title }}</a></span>
    {% endfor %}
</div>
