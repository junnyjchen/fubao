/**
 * @fileoverview 百科页面重定向
 * @description 重定向到新的百科路径 /wiki
 * @module app/baike/page
 */

import { redirect } from 'next/navigation';

export default function Baike() {
  redirect('/wiki');
}
