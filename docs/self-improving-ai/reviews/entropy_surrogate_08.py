"""Pedagogical on-policy entropy surrogate, not a complete TTA training loop."""
from __future__ import annotations
import torch
import torch.nn.functional as F

def entropy_surrogate(
    logits: torch.Tensor,
    sampled_tokens: torch.Tensor,
    valid_mask: torch.Tensor,
    baseline: float = 0.0,
) -> torch.Tensor:
    """Return per-sequence losses. Mask includes EOS and excludes padding.

    Tokens must come from the same policy used to recompute logits. This function
    cannot verify that sampling assumption. All token IDs, including padding,
    must be valid vocabulary indices. baseline is a fixed action-independent scalar.
    """
    if logits.ndim != 3 or logits.shape[-1] < 2:
        raise ValueError('logits must have shape [batch, time, vocabulary].')
    if sampled_tokens.shape != logits.shape[:2] or valid_mask.shape != logits.shape[:2]:
        raise ValueError('Token/mask shapes must equal [batch, time].')
    if sampled_tokens.dtype != torch.long or valid_mask.dtype != torch.bool:
        raise TypeError('Tokens must be long and mask must be bool.')
    if sampled_tokens.device != logits.device or valid_mask.device != logits.device:
        raise ValueError('All tensors must be on the same device.')
    if not logits.is_floating_point() or not torch.isfinite(logits).all():
        raise ValueError('Use finite floating-point logits.')
    if not torch.isfinite(torch.tensor(baseline)):
        raise ValueError('Baseline must be finite.')
    if (sampled_tokens < 0).any() or (sampled_tokens >= logits.shape[-1]).any():
        raise ValueError('All token IDs must be valid vocabulary indices.')
    if logits.shape[0] == 0 or not valid_mask.any(dim=1).all():
        raise ValueError('Every sequence needs at least one valid token.')
    if (valid_mask[:, 1:] & ~valid_mask[:, :-1]).any():
        raise ValueError('Mask must be a valid prefix followed by padding.')
    work = logits.float() if logits.dtype in (torch.float16, torch.bfloat16) else logits
    logp = F.log_softmax(work, dim=-1)
    token_entropy = -(logp.exp() * logp).sum(dim=-1)
    token_logp = logp.gather(-1, sampled_tokens.unsqueeze(-1)).squeeze(-1)
    entropy_sum = (token_entropy * valid_mask).sum(dim=1)
    sequence_logp = (token_logp * valid_mask).sum(dim=1)
    return entropy_sum + (entropy_sum.detach() - baseline) * sequence_logp
