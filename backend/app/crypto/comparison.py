import math
import secrets
import collections
from typing import Dict
from .qrng import qrng_service

class PRNGService:
    """
    Classical Pseudo-Random Number Generator using system randomness (secrets module).
    Used as a baseline for comparison.
    """
    def generate_random_bits(self, num_bits: int) -> str:
        # secrets.randbits returns an int, we convert to binary string
        # format(x, 'b') does not include '0b', but we must ensure it is the correct length
        rand_int = secrets.randbits(num_bits)
        binary_str = format(rand_int, 'b').zfill(num_bits)
        return binary_str

    def generate_random_bytes(self, length: int) -> bytes:
        return secrets.token_bytes(length)

prng_service = PRNGService()

def calculate_shannon_entropy(bit_string: str) -> float:
    """
    Calculates the Shannon entropy of a bit string.
    Max entropy for binary string is 1.0 (perfect randomness).
    """
    if not bit_string:
        return 0.0
        
    length = len(bit_string)
    counts = collections.Counter(bit_string)
    
    entropy = 0.0
    # For binary strings, we usually look at individual bit probabilities
    # But Shannon entropy is usually calculated on symbols. '0' and '1' are our symbols.
    for count in counts.values():
        probability = count / length
        if probability > 0:
            entropy -= probability * math.log2(probability)
        
    return entropy

def get_bit_distribution(bit_string: str) -> Dict[str, int]:
    """
    Returns the count of 0s and 1s.
    """
    counts = collections.Counter(bit_string)
    return {
        "zeros": counts.get("0", 0),
        "ones": counts.get("1", 0),
        "total": len(bit_string)
    }

def calculate_chi_square(bit_string: str) -> float:
    """
    Performs a simple Chi-Square test for uniformity.
    Expected count for 0 and 1 is N/2.
    X^2 = sum( (Observed - Expected)^2 / Expected )
    Lower is better (more uniform).
    """
    n = len(bit_string)
    if n == 0: return 0.0
    
    counts = collections.Counter(bit_string)
    o0 = counts.get("0", 0)
    o1 = counts.get("1", 0)
    expected = n / 2
    
    chi2 = ((o0 - expected)**2 / expected) + ((o1 - expected)**2 / expected)
    return chi2

def perform_comparison(num_bits: int = 128) -> Dict:
    """
    Generates data from both QRNG and PRNG and returns statistical comparison.
    """
    # 1. Generate Bits
    qrng_bits = qrng_service.generate_random_bits(num_bits)
    prng_bits = prng_service.generate_random_bits(num_bits)
    
    # 2. Statistics
    qrng_entropy = calculate_shannon_entropy(qrng_bits)
    prng_entropy = calculate_shannon_entropy(prng_bits)
    
    qrng_chi = calculate_chi_square(qrng_bits)
    prng_chi = calculate_chi_square(prng_bits)
    
    # 3. Get Distribution
    qrng_dist = get_bit_distribution(qrng_bits)
    prng_dist = get_bit_distribution(prng_bits)
    
    return {
        "qrng": {
            "bits": qrng_bits,
            "entropy": round(qrng_entropy, 5),
            "chi_square": round(qrng_chi, 4),
            "distribution": qrng_dist,
            "source": "Quantum (Aer Simulator)"
        },
        "prng": {
            "bits": prng_bits,
            "entropy": round(prng_entropy, 5),
            "chi_square": round(prng_chi, 4),
            "distribution": prng_dist,
            "source": "Classical (Mersenne Twister)"
        }
    }

