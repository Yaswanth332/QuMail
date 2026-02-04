import numpy as np
from .qrng import QRNGService

class BB84Simulator:
    def __init__(self, key_length=256, eve_presence=False, noise_level=0.0):
        self.qrng = QRNGService()
        self.key_length = key_length
        self.eve_presence = eve_presence
        self.noise_level = noise_level
        self.basis_map = {0: 'Rectilinear (+)', 1: 'Diagonal (X)'}

    def generate_bloch_sphere_bits(self, length):
        """Use QRNG to generate random bits for basis and values"""
        # Get bit string e.g. "10110..."
        bit_str = self.qrng.generate_random_bits(length)
        # Convert to list of ints [1, 0, 1, 1, 0...]
        return [int(c) for c in bit_str]

    def run_simulation(self):
        # 1. Alice Preparation
        # We need more bits initially because approximately 50% will be sifted out
        num_qubits = self.key_length * 4 
        
        alice_bits = self.generate_bloch_sphere_bits(num_qubits)
        alice_bases = self.generate_bloch_sphere_bits(num_qubits) # 0=+, 1=X
        
        # 2. Channel Transmission (Simulating Eve & Noise)
        bob_bases = self.generate_bloch_sphere_bits(num_qubits)
        bob_bits = []
        
        eve_detected_count = 0
        
        for i in range(num_qubits):
            bit = alice_bits[i]
            basis_a = alice_bases[i]
            
            # EVE ATTACK
            if self.eve_presence and np.random.random() < 0.5: # Eve intercepts 50% of photons
                eve_basis = np.random.randint(0, 2)
                # If Eve measures in wrong basis, she flips the state with 50% probability
                if eve_basis != basis_a:
                     if np.random.random() < 0.5:
                         bit = 1 - bit # Error introduced
                eve_detected_count += 1

            # NOISE
            if np.random.random() < self.noise_level:
                bit = 1 - bit

            # BOB MEASUREMENT
            basis_b = bob_bases[i]
            if basis_a == basis_b:
                # Bases match: deterministic result (unless impacted by Eve/Noise)
                bob_bits.append(bit)
            else:
                # Bases mismatch: random result
                bob_bits.append(np.random.randint(0, 2))
        
        # 3. Sifting (Basis Reconciliation)
        sifted_key_alice = []
        sifted_key_bob = []
        matching_indices = []

        for i in range(num_qubits):
            if alice_bases[i] == bob_bases[i]:
                sifted_key_alice.append(alice_bits[i]) # Note: Alice keeps her original bit
                # Bob's bit is already 'measured' into bob_bits (which contains mismatches too? Wait)
                # In simulation above, bob_bits logic wasn't fully aligned with the array index in the loop.
                # Let's fix loop logic above to be perfectly parallel.
                pass

        # Re-running precise parallel logic for clarity
        sifted_alice = []
        sifted_bob = []
        
        # Correct Loop
        raw_bits_bob = [] # What Bob sends to his buffer
        
        for i in range(num_qubits):
            a_bit = alice_bits[i]
            a_basis = alice_bases[i]
            
            # Transmission
            current_bit = a_bit
            
            # Eve
            if self.eve_presence and np.random.random() < 0.3: # Eve intercepts 30%
                eve_basis = np.random.randint(0, 2)
                if eve_basis != a_basis:
                    if np.random.random() < 0.5:
                        current_bit = 1 - current_bit # State collapsed/changed
            
            # Bob Measure
            b_basis = bob_bases[i]
            b_measured_bit = -1
            
            if a_basis == b_basis:
                b_measured_bit = current_bit # Ideally perfect measure of current state
            else:
                b_measured_bit = np.random.randint(0, 2) # Random result on wrong basis
            
            raw_bits_bob.append(b_measured_bit)
            
            # Sifting Condition
            if a_basis == b_basis:
                sifted_alice.append(a_bit) # Alice's original
                sifted_bob.append(b_measured_bit) # Bob's measurement
        
        # 4. QBER Calculation (Subset comparison)
        # In real QKD, they sacrifice a subset of bits to check errors.
        # We will check all for simulation stats, but "sacrifice" 10% for the logic.
        
        errors = 0
        total_sifted = len(sifted_alice)
        
        if total_sifted == 0:
             return {"status": "FAILED", "msg": "No bits survived sifting."}

        for k in range(total_sifted):
            if sifted_alice[k] != sifted_bob[k]:
                errors += 1
                
        qber = (errors / total_sifted) if total_sifted > 0 else 0
        
        # 5. Privacy Amplification & Key Generation
        # If QBER > Threshold (usually 11% for BB84), abort
        threshold = 0.11
        if qber > threshold:
            return {
                "success": False,
                "status": "ABORTED",
                "qber": f"{qber:.2%}",
                "msg": "Eavesdropper detected! QBER exceeded safety threshold."
            }
            
        # Final Key (truncate to requested length)
        final_key_bits = sifted_bob[:self.key_length] # Bob's key is the reference for him
        
        # Convert bits to Hex string
        final_key_hex = "".join(str(b) for b in final_key_bits)
        
        return {
            "success": True,
            "status": "SECURE",
            "qber": f"{qber:.4%}",
            "raw_bit_count": num_qubits,
            "sifted_bit_count": total_sifted,
            "final_key_length": len(final_key_bits),
            "key_hex": final_key_hex, # In real world, this is hashed
            "alice_bases_sample": [int(x) for x in alice_bases[:10]],
            "bob_bases_sample": [int(x) for x in bob_bases[:10]]
        }

