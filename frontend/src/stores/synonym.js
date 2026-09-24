import { defineStore } from 'pinia'
import { ref } from 'vue'
import { synonymService } from '../utils/api'

export const useSynonymStore = defineStore('synonym', () => {
  const synonyms = ref([])

  // 获取同义词列表
  const fetchSynonyms = async () => {
    try {
      const response = await synonymService.getAllSynonymGroups()
      synonyms.value = response
      return response
    } catch (error) {
      console.error('获取同义词列表失败:', error)
      throw error
    }
  }

  // 添加同义词（管理员）
  const addSynonym = async (synonymGroup, adminCredentials) => {
    try {
      const response = await synonymService.addSynonymGroup(synonymGroup, adminCredentials)
      // 更新本地同义词列表
      await fetchSynonyms()
      return response
    } catch (error) {
      console.error('添加同义词失败:', error)
      throw error
    }
  }

  // 删除同义词组（管理员）
  const deleteSynonymGroup = async (id, adminCredentials) => {
    try {
      const response = await synonymService.deleteSynonymGroup(id, adminCredentials)
      // 更新本地同义词列表
      await fetchSynonyms()
      return response
    } catch (error) {
      console.error('删除同义词组失败:', error)
      throw error
    }
  }

  // 更新同义词组（管理员）
  const updateSynonym = async (id, updateData, adminCredentials) => {
    try {
      const response = await synonymService.updateSynonymGroup(id, updateData, adminCredentials)
      // 更新本地同义词列表
      await fetchSynonyms()
      return response
    } catch (error) {
      console.error('更新同义词组失败:', error)
      throw error
    }
  }

  return {
    synonyms,
    fetchSynonyms,
    addSynonym,
    deleteSynonymGroup,
    updateSynonym
  }
})