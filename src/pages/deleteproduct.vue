<script setup>
// delete product here
import { useRoute, useRouter } from 'vue-router';
export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        const productId = route.params.id;

        const deleteProduct = async () => {
            try {
                const response = await fetch(`/api/deleteproduct/${productId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    console.log('Product deleted successfully');
                    router.push('/addproduct'); // Redirect to product list after deletion
                } else {
                    console.error('Failed to delete product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        };

        deleteProduct();

        return {};
    },
};
</script>