# PR #118 citation review checkpoint

2026-09-15. Tracking #117. Scientific prose counts remain 7,615 / 7,218 / 7,350; Blogger publication remains incomplete.

Review comment `4011316319` identified the failed FDA announcement hyperlink. Commit `2d47274da3dd830a5be698743147f8a055ef6964` removes that URL from the article, replaces citation [4] with the FDA 2026 approval listing, and labels citation [5] as a search-index-only source note without a purportedly working hyperlink. The listing was opened as an FDA page; its search-indexed September 15 version includes the Isembyld September 11 approval, while the opened cached version was older. This difference is disclosed rather than treated as live content agreement.

The reserve manifest now links to the FDA listing. The original failed-fetch receipt is retained unchanged, not overwritten with a fabricated HTTP success. The edition contract rejects the failed URL in reader prose and requires the replacement reserve link. The source repair ran both the edition and post-content contracts before committing and removed its own one-off workflow. Review response and resolution are attached to the original PR thread.

The earlier rendered-Markdown correction remains at `0ac77f494166b3d30c50119d12708ed53983d4a2`. No scientific-body wording, counts, image files, rights, performance limits or pre-existing tests were weakened by either correction.

Next: verify the complete normal Blog CI for the current final head, check that main has not changed, merge only that reviewed tested head, and separately check Pages deployment plus public article/image availability. Append deployment SHA, run URL and observed live results to #117 instead of creating another documentation-only commit that invalidates completed CI. Do not close #117 while Blogger's actual publication remains unverified. English PR #113 is separate.
